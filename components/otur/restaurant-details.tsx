import { Accessibility, ChefHat, CircleParking, Clock3, CreditCard, ExternalLink, MapPin, Phone, Shirt, Utensils, WalletCards } from 'lucide-react';

import { localize, type Language, type Restaurant } from '@/lib/otur-data';

export function RestaurantDetails({ restaurant, language, labels }: { restaurant: Restaurant; language: Language; labels: Record<string, string> }) {
  const address = localize(restaurant.address, language);
  const rows = [
    { icon: Phone, label: labels.contact, value: restaurant.phone, href: `tel:${restaurant.phone.replace(/\s/g, '')}` },
    { icon: WalletCards, label: labels.price, value: localize(restaurant.priceGuide, language) },
    { icon: Utensils, label: labels.cuisine, value: localize(restaurant.cuisine, language) },
    { icon: Clock3, label: labels.hoursOfOperation, value: localize(restaurant.serviceHours, language) },
    { icon: CreditCard, label: labels.paymentOptions, value: localize(restaurant.payment, language) },
    { icon: CircleParking, label: labels.parking, value: localize(restaurant.parking, language) },
    { icon: Shirt, label: labels.dressCode, value: localize(restaurant.dressCode, language) },
    { icon: ChefHat, label: labels.executiveChef, value: restaurant.chef },
    { icon: Accessibility, label: labels.accessibility, value: localize(restaurant.accessibility, language) },
  ];
  return (
    <section className="restaurant-details" aria-labelledby="restaurant-details-title">
      <div className="details-intro"><span className="overline">{labels.details}</span><h3 id="restaurant-details-title">{labels.beforeYouGo}</h3><p>{localize(restaurant.about, language)}</p></div>
      <div className="location-card">
        <div className="location-copy"><span><MapPin />{labels.address}</span><strong>{address}</strong><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer">{labels.openInMaps}<ExternalLink /></a></div>
        <div className="mini-map" aria-hidden="true"><i className="road road-a" /><i className="road road-b" /><i className="road road-c" /><span className="map-water" /><b><MapPin /></b><small>{restaurant.name}</small></div>
      </div>
      <dl className="details-grid">{rows.map(({ icon: Icon, label, value, href }) => <div key={label}><dt><Icon />{label}</dt><dd>{href ? <a href={href}>{value}</a> : value}</dd></div>)}</dl>
      <p className="details-prototype-note">{labels.venuePrototypeNote}</p>
    </section>
  );
}

