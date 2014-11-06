package com.gwr.bhr4.dto;

import java.util.List;
import java.util.Map;

import com.gwr.bhr4.json.JSONObjectListAbstract;

public class JSONListDto extends JSONObjectListAbstract {

	public JSONListDto(String jsonText) {
		super(jsonText);
	}

	public static void main(String arg[]) {

		String tests = "[{\"connectionType\":0,\"icon\":1,\"id\":0,\"ipAddress\":\"192.168.1.3\",\"ipv6Address\":\"\",\"leaseExpires\":596,\"mac\":\"00:24:be:6f:fa:1a\",\"name\":\"Erica-PC\",\"portForwardServices\":\"\",\"staticCheckbox\":false,\"staticIp\":false,\"status\":false},{\"connectionType\":4,\"icon\":1,\"id\":1,\"ipAddress\":\"192.168.1.4\",\"ipv6Address\":\"\",\"leaseExpires\":1408,\"mac\":\"24:a2:e1:87:a8:99\",\"name\":\"Peggy-iPhone\",\"portForwardServices\":\"\",\"staticCheckbox\":false,\"staticIp\":false,\"status\":true},{\"connectionType\":0,\"icon\":1,\"id\":2,\"ipAddress\":\"192.168.1.2\",\"ipv6Address\":\"\",\"leaseExpires\":1386,\"mac\":\"20:1a:06:25:28:cd\",\"name\":\"idea-PC\",\"portForwardServices\":\"\",\"staticCheckbox\":false,\"staticIp\":false,\"status\":false},{\"connectionType\":5,\"icon\":1,\"id\":3,\"ipAddress\":\"192.168.1.5\",\"ipv6Address\":\"\",\"leaseExpires\":1407,\"mac\":\"80:56:f2:84:48:e9\",\"name\":\"Dell-PC\",\"portForwardServices\":\"\",\"staticCheckbox\":false,\"staticIp\":false,\"status\":true},{\"connectionType\":4,\"icon\":1,\"id\":4,\"ipAddress\":\"192.168.1.6\",\"ipv6Address\":\"\",\"leaseExpires\":1421,\"mac\":\"00:a0:96:69:3f:ad\",\"name\":\"Erica-iPad\",\"portForwardServices\":\"\",\"staticCheckbox\":false,\"staticIp\":false,\"status\":false},{\"connectionType\":0,\"icon\":1,\"id\":5,\"ipAddress\":\"192.168.1.7\",\"ipv6Address\":\"\",\"leaseExpires\":1421,\"mac\":\"54:42:49:cb:77:dd\",\"name\":\"new-host-3\",\"portForwardServices\":\"\",\"staticCheckbox\":false,\"staticIp\":false,\"status\":false},{\"connectionType\":5,\"icon\":1,\"id\":6,\"ipAddress\":\"192.168.1.8\",\"ipv6Address\":\"\",\"leaseExpires\":1430,\"mac\":\"00:19:c5:96:b9:20\",\"name\":\"Home-PC\",\"portForwardServices\":\"\",\"staticCheckbox\":false,\"staticIp\":false,\"status\":true}]";
		String by = "{\"connectionType\":0,\"icon\":1,\"id\":0,\"ipAddress\":\"192.168.1.3\",\"ipv6Address\":\"\",\"leaseExpires\":596,\"mac\":\"00:24:be:6f:fa:1a\",\"name\":\"Test-PC\",\"portForwardServices\":\"\",\"staticCheckbox\":false,\"staticIp\":false,\"status\":false}";
		JSONListDto dto = new JSONListDto(tests);
		System.out.println(dto.getJson());
		dump(dto.getMapList());
		System.out.println(dto.getJsonTextByIndex("id", "1"));
		dump(dto.getMapByIndex("id", "1"));
		System.out.println(dto.getJsonTextByListIndex("1"));
		dump(dto.getMapByListIndex("2"));
		
		dto.replaceFieldsByIndex("id", "0", by);
		System.out.println(dto.getJson());
		dump(dto.getMapList());
		String by1 = "{\"connectionType\":0,\"icon\":1,\"id\":0,\"ipAddress\":\"193.168.1.3\",\"ipv6Address\":\"\",\"leaseExpires\":596,\"mac\":\"00:24:be:6f:fa:1a\",\"name\":\"Test-PC\",\"portForwardServices\":\"\",\"staticCheckbox\":false,\"staticIp\":false,\"status\":false}";
		dto.replaceFieldsByListIndex("0", by1);
		System.out.println(dto.getJson());
		dump(dto.getMapList());
	}

}
