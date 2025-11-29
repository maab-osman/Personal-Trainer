// src/types.ts

export type CustomerLink = {
  href: string;
};

export type Customer = {
  firstname: string;
  lastname: string;
  streetaddress: string;
  postcode: string;
  city: string;
  email: string;
  phone: string;
  _links?: {
    self: CustomerLink;
    customer: CustomerLink;
    trainings: CustomerLink;
  };
};

export type TrainingLinks = {
  training: { href: string };
  customer: { href: string };
};

export type Training = {
  date: string;
  activity: string;
  duration: number;
  customer: Customer | null;
  links: TrainingLinks;
};
