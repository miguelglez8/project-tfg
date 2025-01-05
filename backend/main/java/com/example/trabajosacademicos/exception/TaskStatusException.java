package com.example.trabajosacademicos.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class TaskStatusException extends RuntimeException {
    public TaskStatusException(String message) {
        super(message);
    }
}
