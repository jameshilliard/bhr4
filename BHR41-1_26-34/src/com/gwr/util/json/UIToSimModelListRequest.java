package com.gwr.util.json;

import java.util.ArrayList;
import java.util.List;


public class UIToSimModelListRequest extends JSONUtilities {

	protected String json;
	protected List<JsonDataModel> jsonModelList;

	/**
	 * 
	 */
	public UIToSimModelListRequest(String json) {
		this.jsonModelList = new ArrayList<JsonDataModel>();
		this.json = json;
		this.parse(this.jsonModelList, this.json);
	}


	/* ***************** */
	/* GETTERS			 */
	/* ***************** */
	public List<JsonDataModel> getModelList() { return this.jsonModelList; }
}