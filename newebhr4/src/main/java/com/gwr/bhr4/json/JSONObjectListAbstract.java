package com.gwr.bhr4.json;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class JSONObjectListAbstract extends JSONAbstract {
	private final static Logger logger = LoggerFactory
			.getLogger(JSONObjectListAbstract.class);

	protected String jsonText = "";
	protected List<Map> mapObjs;

	public JSONObjectListAbstract(String s) {
		this.jsonText = s;
		this.mapObjs = this.marshallJsonList(this.jsonText);
	}

	public String getJson() {
		return this.jsonText;
	}

	@SuppressWarnings("rawtypes")
	public List<Map> getMapList() {
		return this.mapObjs;
	}

	// get a json text by a idName 'id' and the value '1' from this maps
	@SuppressWarnings("rawtypes")
	public String getJsonTextByIndex(String idName, String idx) {
		Map thisOne = getMapByIndex(idName, idx);
		return this.unmarshallJson(thisOne);
	}

	public Map getMapByIndex(String idName, String idx) {
		Map thisOne = null;
		for (Map p : mapObjs) {
			String id = "" + p.get(idName);
			if (idx.equals(id)) {
				thisOne = p;
				break;
			}
		}
		return thisOne;
	}

	// get a json text by a specified element from json text
	@SuppressWarnings("rawtypes")
	public String getJsonTextByListIndex(String idx) {
		Map map = getMapByListIndex(idx);
		return this.unmarshallJson(map);
	}

	@SuppressWarnings("rawtypes")
	public Map getMapByListIndex(String idx) {
		return mapObjs.get(Integer.parseInt(idx));
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void replaceFieldsByIndex(String idName, String idx, String byJson) {

		Map thisOne = getMapByIndex(idName, idx);

		Map mapBy = this.marshallJson(byJson);
		// don't update id at all, TODO
		if(thisOne != null){
			mapBy.remove(idName);
			thisOne.putAll(mapBy);
		}
		this.jsonText = this.unmarshallJsonList(this.mapObjs);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void replaceFieldsByListIndex(String idx, String byJson) {

		Map thisOne = getMapByListIndex(idx);

		Map mapBy = this.marshallJson(byJson);
		if(thisOne != null){
			thisOne.putAll(mapBy);
		}
		this.jsonText = this.unmarshallJsonList(this.mapObjs);
	}

}
