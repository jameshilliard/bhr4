package com.gwr.bhr4.api.wireless.model;

import java.util.Map;

import com.gwr.bhr4.api.ModelAbstract;
import com.gwr.bhr4.dto.JSONDto;
import com.gwr.bhr4.dto.JSONListDto;

public class Wireless extends ModelAbstract {

	JSONListDto jSONListDto;

	public Wireless(String jsontext) {
		jSONListDto = new JSONListDto(jsontext);
	}
	
	public String getJson(){
		return jSONListDto.getJson();
	}

	@SuppressWarnings("rawtypes")
	public Map getByIndex(String idx) {
		for (Map p : jSONListDto.getMapList()) {
			String id = "" + p.get("id");
			if (idx.equals(id))
				return p;
		}
		return null;
	}
	
	@SuppressWarnings("rawtypes")
	public String getJsonByIndex(String idx) {
		
		Map p = getByIndex(idx);
		return this.unmarshallJson(p);
	}
	
	@SuppressWarnings("rawtypes")
	public Map getSecurity(String idx) {
		Map wireless = this.getByIndex(idx);
		Map sec = (Map) wireless.get("security");
		return sec;
	}

	@SuppressWarnings("rawtypes")
	public Map getWep(String idx) {
		Map security = this.getSecurity(idx);
		Map wep = (Map) security.get("wep");
		return wep;
	}

	@SuppressWarnings("rawtypes")
	public String getWepJson(String idx) {
		Map wep = (Map) getWep(idx);
		return this.unmarshallJson(wep);
	}

	@SuppressWarnings("rawtypes")
	public Map getWpa(String idx) {
		Map security = this.getSecurity(idx);

		Map wpa = (Map) security.get("wpa");

		return wpa;
	}

	@SuppressWarnings("rawtypes")
	public String getWpaJson(String idx) {
		Map wpa = (Map) getWpa(idx);
		return this.unmarshallJson(wpa);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void replaceWep(String idx, Map mapBy) {
		Map thisOne = getWep(idx);
		thisOne.putAll(mapBy);
	}

	@SuppressWarnings({ "rawtypes" })
	public void replaceWep(String idx, String jsonText) {
		Map mapBy = this.marshallJson(jsonText);
		replaceWep(idx, mapBy);
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void replaceWpa(String idx, Map mapBy) {
		Map thisOne = getWpa(idx);
		thisOne.putAll(mapBy);

	}

	@SuppressWarnings({ "rawtypes" })
	public void replaceWpa(String idx, String jsonText) {
		Map mapBy = this.marshallJson(jsonText);
		replaceWpa(idx, mapBy);
	}
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public void replaceByIndex(String idx, String jsonText) {
		Map thisOne = getByIndex(idx);
		Map mapBy = this.marshallJson(jsonText);
		thisOne.putAll(mapBy);
	}

}
