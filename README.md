<div align="center">

# OpenClassrooms - Eco-Bliss-Bath
</div>

<p align="center">
    <img src="https://img.shields.io/badge/MariaDB-v11.7.2-blue">
    <img src="https://img.shields.io/badge/Symfony-v6.2-blue">
    <img src="https://img.shields.io/badge/Angular-v13.3.0-blue">
    <img src="https://img.shields.io/badge/docker--build-passing-brightgreen">
  <br><br><br>
</p>

# Prérequis
Pour démarrer cet applicatif web vous devez avoir les outils suivants:
- Docker
- NodeJs

# Installation et démarrage
Clonez le projet pour le récupérer
``` 
git clone https://github.com/OpenClassrooms-Student-Center/Eco-Bliss-Bath-V2.git
cd Eco-Bliss-Bath-V2
```
Pour démarrer l'API avec ça base de données.
```
docker compose up -d
```
# Pour démarrer le frontend de l'applicatif
Rendez-vous dans le dossier frontend
```
cd ./frontend
```
Installez les dépendances du projet
```
npm i
ou
npm install (si vous préférez)
```
# Lancer les tests automatisés

## Ouvrir Cypress

Depuis la racine du projet :

```bash
npx cypress open
```

Puis sélectionner le navigateur souhaité et exécuter les tests.

## Exécuter tous les tests

```bash
npx cypress run
```

## Catégories de tests

Les tests automatisés sont répartis en quatre catégories :

- **Smoke tests** : vérification des fonctionnalités essentielles de l'application.
- **Tests API** : validation des principaux endpoints de l'API.
- **Tests fonctionnels** : vérification des scénarios critiques du panier.
- **Tests XSS** : vérification de la protection contre les injections de scripts.

## Résultats de la campagne

La campagne de tests a permis de mettre en évidence plusieurs anomalies :

- l'accès au panier sans authentification retourne un code **401** au lieu du **403** attendu ;
- l'ajout d'un produit indisponible est accepté par l'API ;
- certains scénarios fonctionnels n'ont pas pu être exécutés car le jeu de données ne contient aucun produit avec un stock positif.
