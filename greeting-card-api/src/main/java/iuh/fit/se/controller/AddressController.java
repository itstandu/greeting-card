package iuh.fit.se.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import iuh.fit.se.dto.request.CreateAddressRequest;
import iuh.fit.se.dto.request.UpdateAddressRequest;
import iuh.fit.se.dto.response.ApiResponse;
import iuh.fit.se.dto.response.UserAddressResponse;
import iuh.fit.se.service.AddressService;
import iuh.fit.se.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {
  private final AddressService addressService;
  private final UserService userService;

  @GetMapping
  public ResponseEntity<ApiResponse<List<UserAddressResponse>>> getMyAddresses(
      @AuthenticationPrincipal UserDetails userDetails) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    List<UserAddressResponse> addresses = addressService.getUserAddresses(userId);
    return ResponseEntity.ok(ApiResponse.success(addresses));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<UserAddressResponse>> createAddress(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody CreateAddressRequest request) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    UserAddressResponse address = addressService.createAddress(userId, request);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success("Thêm địa chỉ thành công", address));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<UserAddressResponse>> updateAddress(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable Long id,
      @Valid @RequestBody UpdateAddressRequest request) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    UserAddressResponse address = addressService.updateAddress(userId, id, request);
    return ResponseEntity.ok(ApiResponse.success("Cập nhật địa chỉ thành công", address));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteAddress(
      @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    addressService.deleteAddress(userId, id);
    return ResponseEntity.ok(ApiResponse.success("Xóa địa chỉ thành công", null));
  }

  @PutMapping("/{id}/set-default")
  public ResponseEntity<ApiResponse<UserAddressResponse>> setDefaultAddress(
      @AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
    Long userId = userService.getUserIdByEmail(userDetails.getUsername());
    UserAddressResponse address = addressService.setDefaultAddress(userId, id);
    return ResponseEntity.ok(ApiResponse.success("Đã đặt làm địa chỉ mặc định", address));
  }
}
