package com.gwr.util.json;



/**
 * This is the request that comes from the interface to the board.
 * 
 * {
 *	"version":"0.0.1a",
 *	"autoCheckType":1,
 *	"checkInterval":24,
 *	"checkUrl":"http://greenwavereality.com/firmware",
 *	"newestVersion":"0.0.1a"
 * }
 * 
 * 
 * @author jerry skidmore
 *
 */
public class SimToUIJSONModelResponse extends JSONUtilities {
	private JsonDataModel model;

	/**
	 * 
	 */
	public SimToUIJSONModelResponse() {}

	/**
	 * 
	 * @return
	 */
    public String toJSON() {
		return this._toJSON(model);
	}

	/**
	 * 
	 * @return
	 */
	public JsonDataModel getModel() {
		return model;
	}

	/**
	 * 
	 * @param devicesObjList
	 */
	public void setModel(JsonDataModel model) {
		this.model = model;
	}
}