package iuh.fit.se.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

  private static final int MIN_LENGTH = 8;
  private static final int MAX_LENGTH = 128;
  private static final String UPPERCASE_PATTERN = ".*[A-Z].*";
  private static final String LOWERCASE_PATTERN = ".*[a-z].*";
  private static final String DIGIT_PATTERN = ".*[0-9].*";
  private static final String SPECIAL_CHAR_PATTERN = ".*[!@#$%^&*()_+\\-=\\[\\]{}|;:,.<>?].*";
  private static final String NO_WHITESPACE_PATTERN = "^\\S*$";

  @Override
  public void initialize(ValidPassword constraintAnnotation) {
    // No initialization needed
  }

  @Override
  public boolean isValid(String password, ConstraintValidatorContext context) {
    if (password == null || password.isBlank()) {
      return false;
    }

    // Disable default constraint violation
    context.disableDefaultConstraintViolation();

    // Check length
    if (password.length() < MIN_LENGTH) {
      context
          .buildConstraintViolationWithTemplate("Mật khẩu phải có ít nhất " + MIN_LENGTH + " ký tự")
          .addConstraintViolation();
      return false;
    }

    if (password.length() > MAX_LENGTH) {
      context
          .buildConstraintViolationWithTemplate(
              "Mật khẩu không được vượt quá " + MAX_LENGTH + " ký tự")
          .addConstraintViolation();
      return false;
    }

    // Check uppercase
    if (!password.matches(UPPERCASE_PATTERN)) {
      context
          .buildConstraintViolationWithTemplate("Mật khẩu phải có ít nhất 1 chữ hoa")
          .addConstraintViolation();
      return false;
    }

    // Check lowercase
    if (!password.matches(LOWERCASE_PATTERN)) {
      context
          .buildConstraintViolationWithTemplate("Mật khẩu phải có ít nhất 1 chữ thường")
          .addConstraintViolation();
      return false;
    }

    // Check digit
    if (!password.matches(DIGIT_PATTERN)) {
      context
          .buildConstraintViolationWithTemplate("Mật khẩu phải có ít nhất 1 số")
          .addConstraintViolation();
      return false;
    }

    // Check special character
    if (!password.matches(SPECIAL_CHAR_PATTERN)) {
      context
          .buildConstraintViolationWithTemplate(
              "Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*()_+-=[]{}|;:,.<>?)")
          .addConstraintViolation();
      return false;
    }

    // Check no whitespace
    if (!password.matches(NO_WHITESPACE_PATTERN)) {
      context
          .buildConstraintViolationWithTemplate("Mật khẩu không được chứa khoảng trắng")
          .addConstraintViolation();
      return false;
    }

    return true;
  }
}
