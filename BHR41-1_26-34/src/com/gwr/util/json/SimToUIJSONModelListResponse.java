package com.gwr.util.json;

import java.util.List;

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