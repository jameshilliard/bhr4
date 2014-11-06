package com.gwr.bhr4.json;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/*
 *  One Map object common function
 */
public abstract class JSONObjectAbstract extends JSONAbstract {
	private final static Logger logger = LoggerFactory
			.getLogger(JSONObjectAbstract.class);

	protected String jsonText = "";
	protected Map mapObj;

	public JSONObjectAbstract(String jsonStr){
		this.jsonText = jsonStr;
		this.mapObj = this.marshallJson(this.jsonText);
	}
	
	public String getJson() {
		return this.jsonText;
	}

	@SuppressWarnings("rawtypes")
	public Map getMap() {
		return this.mapObj;
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void replaceJsonFields(String byJson) {
		Map mapBy = marshallJson(byJson);
		this.replaceJsonFields(mapBy);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void replaceJsonFields(Map mapBy) {
		this.mapObj.putAll(mapBy);
		this.jsonText = this.unmarshallJson(this.mapObj);
	}
}
