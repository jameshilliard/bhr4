package com.gwr.bhr4.exception;

public class UnAuthException extends RuntimeException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public UnAuthException(String exceptionMsg) {
		super(exceptionMsg);
	}

}
