package com.example.trabajosacademicos.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class JobException extends RuntimeException {
    public JobException(String message) {
        super(message);
    }
}
