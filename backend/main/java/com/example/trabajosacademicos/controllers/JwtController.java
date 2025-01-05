package com.example.trabajosacademicos.controllers;

import com.example.trabajosacademicos.dtos.UserDTO;
import com.example.trabajosacademicos.jwt.JwtService;
import com.example.trabajosacademicos.requests.TokenRequest;
import com.example.trabajosacademicos.services.UserService;
import com.example.trabajosacademicos.zegocloud.TokenServerAssistant;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Base64;

@CrossOrigin(origins = "${cross.origin}")
@AllArgsConstructor
@RestController
@RequestMapping("/api/token")
public class JwtController {
    private final JwtService jwtService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<Boolean> validateToken(@RequestParam String token, @RequestParam String email) {
        UserDTO user = userService.getUserByEmail(email);

        if (user != null) {
            try {
                if (jwtService.isTokenValid(token, email)) {
                    return ResponseEntity.ok(true);
                } else {
                    return ResponseEntity.ok(false);
                }
            } catch (Exception e) {
                return ResponseEntity.ok(false);
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping
    public ResponseEntity generateToken(@Valid @RequestBody TokenRequest tokenRequest) {
        try {
            long appId = tokenRequest.getAppId();
            String serverSecret = tokenRequest.getSecret();
            String userId = tokenRequest.getUserId();
            int effectiveTimeInSeconds = tokenRequest.getEffectiveTimeInSeconds();

            JSONObject payloadData = new JSONObject();
            payloadData.put("room_id", "demo");
            JSONObject privilege = new JSONObject();
            privilege.put(TokenServerAssistant.PrivilegeKeyLogin, TokenServerAssistant.PrivilegeEnable);

            privilege.put(TokenServerAssistant.PrivilegeKeyPublish, TokenServerAssistant.PrivilegeDisable);
            payloadData.put("privilege", privilege);
            payloadData.put("stream_id_list", null);
            String payload = payloadData.toJSONString();

            TokenServerAssistant.VERBOSE = false;
            TokenServerAssistant.TokenInfo token = TokenServerAssistant.generateToken04(appId,  userId, serverSecret, effectiveTimeInSeconds, payload);

            if (token.error == null || token.error.code == TokenServerAssistant.ErrorCode.SUCCESS) {
                decryptToken(token.data, serverSecret);
            }

            return ResponseEntity.ok(token.data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generate token: " + e.getMessage());
        }
    }

    static private void decryptToken(String token, String secretKey) {
        String noVersionToken = token.substring(2);

        byte[] tokenBytes = Base64.getDecoder().decode(noVersionToken.getBytes());
        ByteBuffer buffer = ByteBuffer.wrap(tokenBytes);
        buffer.order(ByteOrder.BIG_ENDIAN);
        long expiredTime = buffer.getLong();
        int IVLength = buffer.getShort();
        byte[] ivBytes = new byte[IVLength];
        buffer.get(ivBytes);
        int contentLength = buffer.getShort();
        byte[] contentBytes = new byte[contentLength];
        buffer.get(contentBytes);

        try {
            SecretKeySpec key = new SecretKeySpec(secretKey.getBytes(), "AES");
            IvParameterSpec iv = new IvParameterSpec(ivBytes);

            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, key, iv);

            byte[] rawBytes = cipher.doFinal(contentBytes);
            JSONParser parser = new JSONParser();
            JSONObject json = (JSONObject)parser.parse(new String(rawBytes));
            System.out.println(json);
        } catch (Exception e) {
            System.out.println("decrypt failed: " + e);
        }
    }

}
