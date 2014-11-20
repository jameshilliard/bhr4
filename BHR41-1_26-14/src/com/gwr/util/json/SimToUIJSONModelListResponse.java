package com.gwr.util.json;

import java.util.List;

/**
 * This is the request that comes from the interface to the board.
 * 
 * 
 * @author jerry skidmore
 * 
 */
public class SimToUIJSONModelListResponse extends JSONUtilities {

	private List<JsonDataModel> modelList;

	/**
	 * 
	 */
	public SimToUIJSONModelListResponse() {
	}

	/**
	 * 
	 * @return
	 */
	public String toJSON() {
		if (this.modelList == null)
			return "[]";
		else
			return this._toJSON(this.modelList);
	}

	/**
	 * 
	 * @return
	 */
	public List<JsonDataModel> getJSONModelList() {
		return modelList;
	}

	/**
	 * 
	 * @param devicesObjList
	 */
	public void setModelList(List<JsonDataModel> modelList) {
		if (modelList == null || modelList.isEmpty())
			return;

		this.modelList = modelList;
	}
}