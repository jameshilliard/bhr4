package com.gwr.bhr4.json;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gwr.util.json.JsonDataModel;
import com.gwr.util.json.SimToUIJSONModelListResponse;
import com.gwr.util.json.UIToSimModelListRequest;

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
		if (thisOne != null) {
			mapBy.remove(idName);
			thisOne.putAll(mapBy);
		}
		this.jsonText = this.unmarshallJsonList(this.mapObjs);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void replaceFieldsByListIndex(String idx, String byJson) {

		Map thisOne = getMapByListIndex(idx);

		Map mapBy = this.marshallJson(byJson);
		if (thisOne != null) {
			thisOne.putAll(mapBy);
		}
		this.jsonText = this.unmarshallJsonList(this.mapObjs);
	}

	public void deleteByIndexName(String idName, String idx) {

		for (int i = 0; i < this.mapObjs.size(); i++) {
			String sid = ((Long) ((Map) mapObjs.get(i)).get(idName)) + "";

			if (sid.equals(idx)) {
				mapObjs.remove(i);
				break;

			}
		}
	}

	@SuppressWarnings("unchecked")
	public void addOneByIndex(String idName, String byJson) {

		Map mapin = this.marshallJson(byJson);
		long nextID = getNextIDInList(idName);

		mapin.put(idName, nextID);
		mapObjs.add(mapin);

	}

	@SuppressWarnings({ "rawtypes" })
	private long getNextIDInList(String idName) {

		// if original array is empty, start with 1
		if (mapObjs == null || mapObjs.isEmpty())
			return 1;

		long maxIDInList = 0;
		for (Map model : mapObjs) {
			Long lid = (Long) model.get(idName);
			if (lid > maxIDInList) {
				maxIDInList = lid;
			}
		}

		return (maxIDInList + 1);
	}

}
