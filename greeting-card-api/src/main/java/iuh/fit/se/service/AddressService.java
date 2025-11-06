package iuh.fit.se.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import iuh.fit.se.dto.request.CreateAddressRequest;
import iuh.fit.se.dto.request.UpdateAddressRequest;
import iuh.fit.se.dto.response.UserAddressResponse;
import iuh.fit.se.entity.User;
import iuh.fit.se.entity.UserAddress;
import iuh.fit.se.exception.ResourceNotFoundException;
import iuh.fit.se.repository.UserAddressRepository;
import iuh.fit.se.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AddressService {
  private final UserAddressRepository addressRepository;
  private final UserRepository userRepository;

  @Transactional(readOnly = true)
  public List<UserAddressResponse> getUserAddresses(Long userId) {
    List<UserAddress> addresses =
        addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
    return addresses.stream().map(this::toResponse).collect(Collectors.toList());
  }

  public UserAddressResponse createAddress(Long userId, CreateAddressRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

    UserAddress address = new UserAddress();
    address.setUser(user);
    address.setRecipientName(request.getRecipientName());
    address.setPhone(request.getPhone());
    address.setAddressLine1(request.getAddressLine1());
    address.setAddressLine2(request.getAddressLine2());
    address.setCity(request.getCity());
    address.setDistrict(request.getDistrict());
    address.setWard(request.getWard());
    address.setPostalCode(request.getPostalCode());

    // If this is the first address or explicitly set as default
    List<UserAddress> existingAddresses = addressRepository.findByUserId(userId);
    if (existingAddresses.isEmpty() || Boolean.TRUE.equals(request.getIsDefault())) {
      // Clear default from other addresses
      existingAddresses.forEach(a -> a.setIsDefault(false));
      addressRepository.saveAll(existingAddresses);
      address.setIsDefault(true);
    } else {
      address.setIsDefault(false);
    }

    address = addressRepository.save(address);
    log.info("Created address {} for user {}", address.getId(), userId);
    return toResponse(address);
  }

  public UserAddressResponse updateAddress(
      Long userId, Long addressId, UpdateAddressRequest request) {
    UserAddress address =
        addressRepository
            .findById(addressId)
            .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ không tồn tại"));

    if (!address.getUser().getId().equals(userId)) {
      throw new IllegalArgumentException("Địa chỉ không thuộc về user này");
    }

    if (request.getRecipientName() != null) {
      address.setRecipientName(request.getRecipientName());
    }
    if (request.getPhone() != null) {
      address.setPhone(request.getPhone());
    }
    if (request.getAddressLine1() != null) {
      address.setAddressLine1(request.getAddressLine1());
    }
    if (request.getAddressLine2() != null) {
      address.setAddressLine2(request.getAddressLine2());
    }
    if (request.getCity() != null) {
      address.setCity(request.getCity());
    }
    if (request.getDistrict() != null) {
      address.setDistrict(request.getDistrict());
    }
    if (request.getWard() != null) {
      address.setWard(request.getWard());
    }
    if (request.getPostalCode() != null) {
      address.setPostalCode(request.getPostalCode());
    }

    address = addressRepository.save(address);
    log.info("Updated address {} for user {}", addressId, userId);
    return toResponse(address);
  }

  public void deleteAddress(Long userId, Long addressId) {
    UserAddress address =
        addressRepository
            .findById(addressId)
            .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ không tồn tại"));

    if (!address.getUser().getId().equals(userId)) {
      throw new IllegalArgumentException("Địa chỉ không thuộc về user này");
    }

    boolean wasDefault = address.getIsDefault();
    addressRepository.delete(address);
    log.info("Deleted address {} for user {}", addressId, userId);

    // If deleted address was default, set another one as default
    if (wasDefault) {
      List<UserAddress> remainingAddresses = addressRepository.findByUserId(userId);
      if (!remainingAddresses.isEmpty()) {
        remainingAddresses.get(0).setIsDefault(true);
        addressRepository.save(remainingAddresses.get(0));
      }
    }
  }

  public UserAddressResponse setDefaultAddress(Long userId, Long addressId) {
    UserAddress address =
        addressRepository
            .findById(addressId)
            .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ không tồn tại"));

    if (!address.getUser().getId().equals(userId)) {
      throw new IllegalArgumentException("Địa chỉ không thuộc về user này");
    }

    // Clear default from all addresses
    List<UserAddress> allAddresses = addressRepository.findByUserId(userId);
    allAddresses.forEach(a -> a.setIsDefault(false));
    addressRepository.saveAll(allAddresses);

    // Set this address as default
    address.setIsDefault(true);
    address = addressRepository.save(address);
    log.info("Set address {} as default for user {}", addressId, userId);
    return toResponse(address);
  }

  private UserAddressResponse toResponse(UserAddress address) {
    return new UserAddressResponse(
        address.getId(),
        address.getRecipientName(),
        address.getPhone(),
        address.getAddressLine1(),
        address.getAddressLine2(),
        address.getCity(),
        address.getDistrict(),
        address.getWard(),
        address.getPostalCode(),
        address.getIsDefault());
  }
}
