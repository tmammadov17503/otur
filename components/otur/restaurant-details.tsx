import { Accessibility, ChefHat, CircleParking, Clock3, CreditCard, ExternalLink, MapPin, Phone, Shirt, Utensils, WalletCards } from 'lucide-react';

import { localize, type Language, type Restaurant } from '@/lib/otur-data';

export function RestaurantDetails({ restaurant, language, labels }: { restaurant: Restaurant; language: Language; labels: Record<string, string> }) {
  const address = localize(restaurant.address, language);
  const mapUrl = `https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}&z=15&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`;
  const mapLabels = restaurant.id === 'seki'
    ? ['Kichik Gala St', 'Boyuk Gala St', 'Neftchilar Ave', 'Old City']
    : restaurant.id === 'hayat'
      ? ['Nobel Ave', 'White City Blvd', 'Yusif Safarov St', 'Baku White City']
      : ['Neftchilar Ave', 'Mikayil Useynov St', 'Flag Square', 'Caspian Sea'];
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
        <div className="location-copy"><span><MapPin />{labels.address}</span><strong>{address}</strong><a href={directionsUrl} target="_blank" rel="noreferrer">{labels.openInMaps}<ExternalLink /></a></div>
        <div className={`mini-map map-${restaurant.planVariant}`}>
          <svg className="map-fallback" viewBox="0 0 720 360" aria-labelledby={`map-${restaurant.id}-title`}>
            <title id={`map-${restaurant.id}-title`}>{restaurant.name} · {address}</title>
            <rect width="720" height="360" fill="#e7e4d6" />
            <path className="map-block" d="M0 18H215V106H0zM259 0H458V90H259zM503 0H720V118H503zM0 150H162V262H0zM210 137H432V236H210zM480 158H720V266H480zM0 307H238V360H0zM285 280H514V360H285z" />
            <path className="map-road-major" d="M-20 292C122 252 220 225 346 170S589 80 744 43" />
            <path className="map-road" d="M118 -20C156 78 184 186 213 384M438 -20C424 101 434 217 472 384M-20 112C178 123 315 113 744 146" />
            <path className="map-road-minor" d="M-10 54L730 320M38 370L692 -12M319 -20L335 380" />
            {restaurant.id === 'xazri' && <path className="map-sea" d="M570 0H720V360H624c-33-73-50-139-44-207 4-53 1-104-10-153Z" />}
            <text x="34" y="284">{mapLabels[0]}</text><text x="315" y="128">{mapLabels[1]}</text><text x="514" y="318">{mapLabels[2]}</text><text className="map-district" x="32" y="42">{mapLabels[3]}</text>
          </svg>
          <iframe title={`${restaurant.name} · ${labels.address}`} src={mapUrl} loading="lazy" referrerPolicy="no-referrer" />
          <span className="map-location-pin"><MapPin /><strong>{restaurant.name}</strong></span>
        </div>
      </div>
      <dl className="details-grid">{rows.map(({ icon: Icon, label, value, href }) => <div key={label}><dt><Icon />{label}</dt><dd>{href ? <a href={href}>{value}</a> : value}</dd></div>)}</dl>
    </section>
  );
}
