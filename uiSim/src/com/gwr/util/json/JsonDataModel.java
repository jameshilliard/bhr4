package com.gwr.util.json;

import java.util.Map;

/**
 * Each rest response we simulate has a couple of repeating patterns used throughout. It
 * is either Map<String,Object> or a List<Map<String,Object>>. So we create a base object
 * that each model can extend.
 * 
 * The extended Models tend to provide convenience methods to extract the expected data.
 * 
 * @author jerry skidmore
 *
 */
public class JsonDataModel {
	protected Map<String, Object> jsonModel;

	/**
	 * 
	 */
	public void setMap(Map<String,Object> map) { this.jsonModel = map; }

	/**
	 * 
	 * @return
	 */
	public Map<String,Object> getMap() { return this.jsonModel; }

}
