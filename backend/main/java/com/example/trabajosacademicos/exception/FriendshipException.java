package com.example.trabajosacademicos.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class FriendshipException extends RuntimeException {
    public FriendshipException(String message) {
        super(message);
    }
}
