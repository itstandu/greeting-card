// Auth validations
export {
  passwordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  type LoginFormValues,
  type RegisterFormValues,
  type ResendVerificationFormValues,
} from './auth';

// User validations
export {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileFormValues,
  type ChangePasswordFormValues,
} from './user';

// Address validations
export { addressSchema, type AddressFormValues } from './address';

// Contact validations
export { contactSchema, type ContactFormValues } from './contact';

// Product validations
export { productSchema, productImageSchema, type ProductFormValues } from './product';

// Category validations
export { categorySchema, type CategoryFormValues } from './category';

// Admin validations
export { editUserSchema, type EditUserFormValues } from './admin';
