export interface Location {
  id: string
  name: string
  city: string
  state: string
  country: string
  countryCode: string
  description: string
  category: string
  coordinates: {
    lat: number
    lng: number
  }
  thumbnail: string
  tourUrl: string
  affiliate: {
    hotel: string
    experience: string
  }
}

export interface CountryPin {
  id: string
  name: string
  countryCode: string
  lat: number
  lng: number
  locationCount: number
}

export type GlobeMode = 'global' | 'country'
