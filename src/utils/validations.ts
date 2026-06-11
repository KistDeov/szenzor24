export function emailValidation(value: string) {
  return value.includes("@");
}

/**
 * Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
 */
export function passwordValidation(val: string) {
  return (
    /[A-Z]/.test(val) &&
    /[a-z]/.test(val) &&
    /\d/.test(val) &&
    /[@$!%*?&]/.test(val)
  );
}

/**
 * Hungarian postal code validation (4 digits)
 */
export function postalCodeValidation(value: string): boolean {
  const digitsOnly = value.replace(/\D/g, "");
  return /^\d{4}$/.test(digitsOnly);
}

/**
 * City name validation (minimum 2 characters, no numbers)
 */
export function cityValidation(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 2 && /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s\-\.]+$/.test(trimmed);
}

/**
 * Street / public area name validation (minimum 2 characters)
 */
export function streetValidation(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 2;
}

/**
 * Comprehensive shipping address validation
 */
export interface AddressValidation {
  isValid: boolean;
  errors: {
    zip?: string;
    city?: string;
    street?: string;
  };
}

export function validateShippingAddress(address: {
  zip: string;
  city: string;
  street: string;
}): AddressValidation {
  const errors: AddressValidation["errors"] = {};

  if (!postalCodeValidation(address.zip)) {
    errors.zip = "Az irányítószám 4 számjegyből kell, hogy álljon";
  }

  if (!cityValidation(address.city)) {
    errors.city = "A város neve legalább 2 karakter, számokat nem tartalmazhat";
  }

  if (!streetValidation(address.street)) {
    errors.street = "A közterület neve legalább 2 karakter";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
