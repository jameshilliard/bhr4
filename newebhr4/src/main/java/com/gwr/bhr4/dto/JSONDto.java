package com.gwr.bhr4.dto;

import com.gwr.bhr4.json.JSONObjectAbstract;

public class JSONDto extends JSONObjectAbstract {

	public JSONDto(String jsonText){
		super(jsonText);
	}
	
	
	public static void main(String arg[]){
		
		String nowJson = "{\"wpaShowKeyInUI\":true,\"type\":1,\"key\":\"\"}";
		
		String by = "{\"wpaShowKeyInUI\":true,\"type\":1,\"key\":\"thinkgreen\"}";
		JSONDto dto = new JSONDto(nowJson);
		
		System.out.println(dto.getJson());
		dump(dto.getMap());
		dto.replaceJsonFields(by);
		System.out.println(dto.getJson());
		dump(dto.getMap());
	}
}