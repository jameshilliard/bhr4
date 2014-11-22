package com.gwr.util.json;

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.ContainerFactory;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * @author jerry skidmore
 *
 */
public class JSONUtilities {
	private final static Logger logger = LoggerFactory.getLogger(JSONUtilities.class);

	protected boolean parseError;
	
	public boolean isParseError() { return parseError; }
	public void setParseError(boolean parseError) { this.parseError = parseError; }

	/**
	 * Gets the appropriate body variable
	 * 
	 * 
	 * @return
	 * @throws ClassCastException 
	 */
	@SuppressWarnings("unchecked")
	protected Object getBodyData(Map<String,Object> devicesObject) throws ClassCastException {
		if(devicesObject == null || devicesObject.isEmpty())
			return "";

		JSONObject bodyJson = new JSONObject();

		Set<String> keys = devicesObject.keySet();
		Iterator<String> iter = keys.iterator();

		while(iter.hasNext()) {
			String id = (String)iter.next();
			Object datum = (Object)devicesObject.get(id);

			if(datum instanceof String || datum instanceof Number) {
				bodyJson.put(id, datum);
			} else if(datum instanceof List) {
				JSONArray array = new JSONArray();

				for(int i = 0; i < ((List<Object>)datum).size(); i++) {
					array.add(((List<Object>)datum).get(i));
				}

				bodyJson.put(id, array);
			} else if(datum == null) {
				bodyJson.put(id, "");
			} else {
				throw new ClassCastException("Body data object identified by " + id + " is illegal type. Must be Number, String, List, Map");
			}
		}

		return bodyJson;
	}

	/**
	 * 
	 * @return
	 */
	@SuppressWarnings("unchecked")
    protected String _toJSON(JsonDataModel model) {
		JSONObject obj = new JSONObject();

		Iterator<Entry<String,Object>> iter = model.getMap().entrySet().iterator();

		while(iter.hasNext()) {
			Entry<String,Object> entry = iter.next();

			obj.put(entry.getKey(), entry.getValue());
		}

		return obj.toJSONString().replaceAll("\\\\/", "/");
	}

	/**
	 * 
	 * @return
	 */
	@SuppressWarnings("unchecked")
    protected String _toJSON(List<JsonDataModel> model) {
		JSONArray array = new JSONArray();

		for(JsonDataModel devicesObject : model)
			array.add(devicesObject.getMap());

		return array.toJSONString().replaceAll("\\\\/", "/");
	}


	/**
	 * 
	 */
	@SuppressWarnings("unchecked")
    protected void parse(List<JsonDataModel> modelList, String json) {
		JSONParser parser = new JSONParser();

		try {
			ContainerFactory containerFactory = new ContainerFactory() {
				public List<Object> creatArrayContainer() {
					return new LinkedList<Object>();
				}

				public Map<String,Object> createObjectContainer() {
					return new LinkedHashMap<String,Object>();
				}
			};

            List<Object> jsonList = (List<Object>) parser.parse(json, containerFactory);

			for(Object obj : jsonList) {
				modelList.add(this.initializeVariable((Map<String,Object>)obj));
			}
		} catch (ParseException e) {
			this.parseError = true;
			logger.error("Error parsing response from board [" + json + "]", e);
		}

		// clean up after ourselves
		parser.reset();
		parser = null;
	}

	/**
	 * 
	 * @param mapObject
	 * @return
	 */
	private JsonDataModel initializeVariable(Map<String,Object> mapObject) {
		
		JsonDataModel model = new JsonDataModel();
		model.setMap(mapObject);
		
		return model;
	}

	/**
	 * 
	 */
	protected void parse(JsonDataModel model, String json) {
		JSONParser parser = new JSONParser();

		try {
			ContainerFactory containerFactory = new ContainerFactory() {
				public List<Object> creatArrayContainer() {
					return new LinkedList<Object>();
				}

				public Map<String,Object> createObjectContainer() {
					return new LinkedHashMap<String,Object>();
				}
			};

			@SuppressWarnings("unchecked")
            Map<String,Object> jsonMap = (Map<String,Object>) parser.parse(json, containerFactory);

			model.setMap(jsonMap);
		} catch (ParseException e) {
			this.parseError = true;
			logger.error("Error parsing response from board [" + json + "]", e);
		}

		// clean up after ourselves
		parser.reset();
		parser = null;
	}
}
