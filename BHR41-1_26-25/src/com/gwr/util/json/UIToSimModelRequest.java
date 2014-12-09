package com.gwr.util.json;



public class UIToSimModelRequest extends JSONUtilities {

	private JsonDataModel model;
	protected String json;

	/**
	 * 
	 */
	public UIToSimModelRequest(String json) {
		this.model = new JsonDataModel();
		this.json = json;
		this.parse(this.model, json);
	}


	/* ***************** */
	/* GETTERS			 */
	/* ***************** */
	public JsonDataModel getJsonDataModel() { return this.model; }
}