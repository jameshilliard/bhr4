package com.gwr.util.json;



/**
 * This is the request that comes from the interface to the board.
 * 
 * 
 * @author jerry skidmore
 *
 */
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