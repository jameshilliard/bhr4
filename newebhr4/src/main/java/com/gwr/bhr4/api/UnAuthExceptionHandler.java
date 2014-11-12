package com.gwr.bhr4.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.gwr.bhr4.dto.JSONDto;
import com.gwr.bhr4.exception.UnAuthException;

@ControllerAdvice
public class UnAuthExceptionHandler extends ResponseEntityExceptionHandler {
	private static final String failString = com.gwr.bhr4.util.JsonProperties
			.getLoginFailJSON();

	@ExceptionHandler(value = { UnAuthException.class })
	@ResponseStatus(HttpStatus.UNAUTHORIZED)
	protected String handleConflict(RuntimeException ex, WebRequest request) {
		JSONDto dto = new JSONDto(failString);
		dto.getMap().put("attempts", ex.getMessage());
		return dto.getJson();
	}
}