# language: fr
@international @facturation
Fonctionnalité: Gestion du panier et facturation multilingue
  En tant que responsable de la plateforme e-commerce
  Je veux permettre aux utilisateurs francophones de passer commande
  Afin de développer les ventes à l'international

  Contexte:
    Étant donné que le catalogue de produits européens est synchronisé
    Et la devise par défaut est configurée en "EUR"

  Règle: Les remises promotionnelles s'appliquent automatiquement

    Scénario: Application d'un coupon valide
      Étant donné que le panier du client contient des articles d'une valeur de 100.00 euros
      Quand le client saisit le code promo "BIENVENUE10"
      Alors une remise de 10.00 euros est appliquée
      Et le total à payer devient 90.00 euros
