export interface IFamilyMember {
  name: string;
  email?: string;
  dietaryRestrictions: string[];
  isAdult?: boolean;
  isPrimaryContact?: boolean;
}

export interface IFamily {
  primaryEmail: string;
  members: IFamilyMember[];
  familyName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormErrors {
  familyName?: string;
  email?: string;
  members?: {
    [key: number]: {
      name?: string;
      email?: string;
      dietaryRestrictions?: string;
    };
  };
  general?: string;
}
