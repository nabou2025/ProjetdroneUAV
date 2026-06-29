"""
simp_2d.py — Implémentation de l'optimisation topologique SIMP (2D).

Basée sur l'algorithme de référence académique "99 lines of topology
optimization" (Sigmund, 2001 ; portage Python par Hunter (2017) et
adaptations ultérieures largement utilisées dans la littérature).

Aucune dépendance fragile : uniquement numpy + scipy, qui sont stables
et maintenus. C'est volontairement plus simple que d'utiliser une
bibliothèque tierce non maintenue (cf. essai avec topopt, qui plante
sur des versions récentes de numpy).

Ceci est la version 2D — la version 3D (utile pour générer des
structures de drone) suit la même logique mais avec une matrice de
rigidité élémentaire 3D (8 noeuds -> 24 ddl) plus la résolution d'un
système plus grand. Voir simp_3d.py pour la suite.
"""

import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.linalg import spsolve


def lk():
    """Matrice de rigidité élémentaire pour un élément carré 2D (E=1, nu=0.3)."""
    E, nu = 1.0, 0.3
    k = np.array([
        1/2 - nu/6, 1/8 + nu/8, -1/4 - nu/12, -1/8 + 3*nu/8,
        -1/4 + nu/12, -1/8 - nu/8, nu/6, 1/8 - 3*nu/8
    ])
    KE = E / (1 - nu**2) * np.array([
        [k[0], k[1], k[2], k[3], k[4], k[5], k[6], k[7]],
        [k[1], k[0], k[7], k[6], k[5], k[4], k[3], k[2]],
        [k[2], k[7], k[0], k[5], k[6], k[3], k[4], k[1]],
        [k[3], k[6], k[5], k[0], k[7], k[2], k[1], k[4]],
        [k[4], k[5], k[6], k[7], k[0], k[1], k[2], k[3]],
        [k[5], k[4], k[3], k[2], k[1], k[0], k[7], k[6]],
        [k[6], k[3], k[4], k[1], k[2], k[7], k[0], k[5]],
        [k[7], k[2], k[1], k[4], k[3], k[6], k[5], k[0]],
    ])
    return KE


def optimisation_simp_2d(
    nelx: int,
    nely: int,
    volfrac: float,
    penal: float = 3.0,
    rmin: float = 1.5,
    max_iter: int = 60,
    charge_position: str = "coin_bas_droit",
    appui_position: str = "bord_gauche",
):
    """
    Lance une optimisation topologique SIMP 2D.

    Paramètres
    ----------
    nelx, nely : dimensions de la grille (résolution de la pièce)
    volfrac    : fraction volumique cible (ex: 0.4 = on garde 40% du volume)
    penal      : exposant de pénalisation SIMP (3 est la valeur standard)
    rmin       : rayon du filtre (évite les damiers numériques)
    max_iter   : nombre d'itérations
    charge_position / appui_position : configuration simplifiée des
        conditions aux limites (à étendre selon vos vrais cas de charge
        de drone : bras en porte-à-faux, fixation centrale, etc.)

    Retour
    ------
    x : tableau (nely, nelx) de densités finales entre 0 (vide) et 1 (plein)
    historique_compliance : liste de la fonction objectif à chaque itération
    """
    nele = nelx * nely
    ndof = 2 * (nelx + 1) * (nely + 1)

    KE = lk()

    x = volfrac * np.ones(nele)
    xPhys = x.copy()

    # --- préparation du filtre de densité (évite les motifs en damier) ---
    nfilter = int(nele * ((2 * (np.ceil(rmin) - 1) + 1) ** 2))
    iH = np.zeros(nfilter)
    jH = np.zeros(nfilter)
    sH = np.zeros(nfilter)
    cc = 0
    for i in range(nelx):
        for j in range(nely):
            row = i * nely + j
            kk1 = int(np.maximum(i - (np.ceil(rmin) - 1), 0))
            kk2 = int(np.minimum(i + np.ceil(rmin), nelx))
            ll1 = int(np.maximum(j - (np.ceil(rmin) - 1), 0))
            ll2 = int(np.minimum(j + np.ceil(rmin), nely))
            for k in range(kk1, kk2):
                for l in range(ll1, ll2):
                    col = k * nely + l
                    fac = rmin - np.sqrt((i - k) * 2 + (j - l) * 2)
                    iH[cc] = row
                    jH[cc] = col
                    sH[cc] = np.maximum(0.0, fac)
                    cc += 1
    H = coo_matrix((sH, (iH, jH)), shape=(nele, nele)).tocsc()
    Hs = np.array(H.sum(1)).flatten()

    # --- connectivité éléments -> degrés de liberté ---
    edofMat = np.zeros((nele, 8), dtype=int)
    for elx in range(nelx):
        for ely in range(nely):
            el = elx * nely + ely
            n1 = (nely + 1) * elx + ely
            n2 = (nely + 1) * (elx + 1) + ely
            edofMat[el, :] = np.array([
                2*n1+2, 2*n1+3, 2*n2+2, 2*n2+3,
                2*n2, 2*n2+1, 2*n1, 2*n1+1
            ])

    iK = np.kron(edofMat, np.ones((8, 1))).flatten()
    jK = np.kron(edofMat, np.ones((1, 8))).flatten()

    # --- conditions aux limites (simplifiées — à adapter à vos cas réels) ---
    dofs = np.arange(ndof)
    if appui_position == "bord_gauche":
        fixed = dofs[0:2 * (nely + 1)]
    else:
        fixed = dofs[0:2 * (nely + 1)]
    free = np.setdiff1d(dofs, fixed)

    f = np.zeros((ndof, 1))
    if charge_position == "coin_bas_droit":
        f[2 * (nelx + 1) * (nely + 1) - 1, 0] = -1.0
    else:
        f[2 * (nelx + 1) * (nely + 1) - 1, 0] = -1.0

    historique_compliance = []
    Emin, Emax = 1e-9, 1.0
    g = 0.0

    for it in range(max_iter):
        sK = ((KE.flatten()[np.newaxis]).T *
              (Emin + (xPhys) ** penal * (Emax - Emin))).flatten(order='F')
        K = coo_matrix((sK, (iK, jK)), shape=(ndof, ndof)).tocsc()
        K = K[free, :][:, free]

        u = np.zeros((ndof, 1))
        u[free, 0] = spsolve(K, f[free, 0])

        ce = (np.dot(u[edofMat].reshape(nele, 8), KE) *
              u[edofMat].reshape(nele, 8)).sum(1)
        obj = ((Emin + xPhys ** penal * (Emax - Emin)) * ce).sum()
        dc = (-penal * xPhys ** (penal - 1) * (Emax - Emin)) * ce
        dv = np.ones(nele)

        dc = np.asarray(H * (dc[np.newaxis].T / Hs[np.newaxis].T)).flatten()
        dv = np.asarray(H * (dv[np.newaxis].T / Hs[np.newaxis].T)).flatten()

        # méthode des critères d'optimalité (mise à jour standard SIMP)
        l1, l2, move = 0, 1e9, 0.2
        while (l2 - l1) / (l1 + l2) > 1e-3:
            lmid = 0.5 * (l2 + l1)
            xnew = np.maximum(0.0, np.maximum(
                x - move, np.minimum(1.0, np.minimum(
                    x + move, x * np.sqrt(-dc / dv / lmid)))))
            xPhys = np.asarray(H * xnew[np.newaxis].T).flatten() / Hs
            if xPhys.sum() > volfrac * nele:
                l1 = lmid
            else:
                l2 = lmid
        x = xnew

        historique_compliance.append(float(obj))

    x_grid = x.reshape(nelx, nely).T  # (nely, nelx) pour affichage naturel
    return x_grid, historique_compliance