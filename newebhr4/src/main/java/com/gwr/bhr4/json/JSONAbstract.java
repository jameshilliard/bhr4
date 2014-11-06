package com.gwr.bhr4.json;

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONArray;
import org.json.simple.JSONValue;
import org.json.simple.parser.ContainerFactory;
import org.json.simple.parser.JSONParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public abstract class JSONAbstract {
	private final static Logger logger = LoggerFactory
			.getLogger(JSONAbstract.class);

	protected static ContainerFactory containerFactory = new ContainerFactory() {
		@SuppressWarnings("rawtypes")
		public List creatArrayContainer() {
			return new LinkedList();
		}

		@SuppressWarnings("rawtypes")
		public Map createObjectContainer() {
			return new LinkedHashMap();
		}

	};

	@SuppressWarnings("rawtypes")
	protected Map marshallJson(String inJson) {

		Map map = null;

		try {
			JSONParser parser = new JSONParser();
			map = (Map) parser.parse(inJson, containerFactory);
		} catch (org.json.simple.parser.ParseException e) {
			logger.error(inJson);
			logger.error(e.getMessage(), e);
		}
		return map;

	}

	// get List of map from json text array
	@SuppressWarnings({ "rawtypes", "unchecked" })
	protected List<Map> marshallJsonList(String jsonText) {

		List<Map> maps = null;

		try {
			JSONParser parser = new JSONParser();
			maps = (List<Map>) parser.parse(jsonText, containerFactory);
		} catch (org.json.simple.parser.ParseException e) {
			logger.error(jsonText);
			logger.error(e.getMessage(), e);
		}
		return maps;
	}

	@SuppressWarnings("rawtypes")
	protected String unmarshallJson(Map p) {
		return JSONValue.toJSONString(p);
	}

	// convert List of map to json text
	@SuppressWarnings("rawtypes")
	protected String unmarshallJsonList(List<Map> ps) {
		return JSONArray.toJSONString(ps);
	}

	@SuppressWarnings("rawtypes")
	protected static void dump(Map json) {
		Iterator iter = json.entrySet().iterator();
		System.out.println("==iterate result==");
		while (iter.hasNext()) {
			Map.Entry entry = (Map.Entry) iter.next();
			System.out.println(entry.getKey() + "=>" + entry.getValue());
		}

	}

	@SuppressWarnings("rawtypes")
	protected static void dump(List<Map> maps) {
		for (Map m : maps) {
			dump(m);
		}
	}
}
