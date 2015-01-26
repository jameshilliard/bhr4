package com.gwr.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Properties;

import org.apache.commons.codec.digest.DigestUtils;

/**
 * Provides some functionality that is freely available in some of the apache
 * libraries, but then we could possibly have to pull in a bunch more jars just
 * to get a handful of methods...
 * 
 * @author jerry skidmore
 * 
 */
public class StringUtil {

	/**
	 * 
	 * @return
	 */
	public static final String getNewLine() {
		return System.getProperty("line.separator");
	}

	/**
	 * Takes a list and converts each entry to a string. If the list is null, it
	 * returns "--null list--"; if empty, this method returns "--empty list--"
	 * 
	 * @param list
	 * @return
	 */
	public static String listToString(List<?> list) {
		return listToString(list, ", ");
	}

	public static String listToStringWithNewline(List<?> list) {
		return listToString(list, getNewLine());
	}

	/**
	 * 
	 * @param list
	 * @param lineBreak
	 * @return
	 */
	public static String listToString(List<?> list, String lineBreak) {
		if (list == null)
			return "--null list--";
		if (list.isEmpty())
			return "--empty list--";

		StringBuilder strBuf = new StringBuilder();
		strBuf.append("[");
		for (int i = 0; i < list.size(); i++) {
			if (i > 0)
				strBuf.append(lineBreak);

			if (list.get(i) instanceof Map)
				strBuf.append(mapToString((Map) list.get(i)));
			else if (list.get(i) != null)
				strBuf.append(list.get(i).toString());
			else
				strBuf.append("null");
		}
		strBuf.append("]");

		return strBuf.toString();
	}

	/**
	 * 
	 * @param map
	 * @return
	 */
	public static String mapToString(Map<String, ?> map) {
		if (map == null)
			return "--null map--";
		if (map.isEmpty())
			return "--empty map--";

		Iterator<?> iter = map.entrySet().iterator();
		StringBuilder strBuf = new StringBuilder();

		// strBuf.append("JSON ");
		strBuf.append("{ ");

		while (iter.hasNext()) {
			Entry<String, ?> entry = (Entry<String, ?>) iter.next();

			strBuf.append(entry.getKey()).append(": ");

			if (entry.getValue() instanceof List) {
				strBuf.append(listToString((List<?>) entry.getValue()));
			} else if (entry.getValue() instanceof Map) {
				strBuf.append(mapToString(((Map<String, Object>) entry
						.getValue())));
			} else {
				strBuf.append(entry.getValue());
			}

			strBuf.append(", ");
		}

		// remove the trailing comma and replace it with one space
		strBuf.reverse().replace(0, 2, " ").reverse();
		strBuf.append("}");

		return strBuf.toString();
	}

	/**
	 * Very simple
	 * 
	 * @param properties
	 * @return
	 */
	public static String propertiesToString(Properties properties) {
		StringBuilder strB = new StringBuilder();

		if (properties == null) {
			strB.append(" -- null properties --");
		} else if (properties.isEmpty()) {
			strB.append(" -- empty properties -- ");
		} else {
			strB.append("[").append(getNewLine());

			Iterator<Entry<Object, Object>> iter = properties.entrySet()
					.iterator();
			while (iter.hasNext()) {
				Entry<Object, Object> entry = iter.next();

				strB.append("\t[ ").append(entry.getKey()).append(" --> ")
						.append(entry.getValue()).append(" ]")
						.append(getNewLine());
			}

			strB.append(getNewLine()).append("]");
		}

		return strB.toString();
	}

	/**
	 * 
	 * @param str1
	 * @param str2
	 * @return
	 */
	public static boolean equals(String str1, String str2) {
		if (str1 == null && str2 == null)
			return true;
		if (str1 == null && str2 != null)
			return false;
		if (str1 != null && str2 == null)
			return false;

		return str1.equalsIgnoreCase(str2);
	}

	public static String retrieveId(String s, String lastWord) {

		int i = s.indexOf(lastWord);
		if(i < 0)
			return null;
		String s1 = s.substring(0, i - 1);
		i = s1.lastIndexOf("/");
		return s1.substring(i + 1);
	}

	public static String retrieveLastId(String s, String lastWord) {

		int i = s.indexOf(lastWord);
		if(i < 0)
			return null;
		int start = i + lastWord.length() + 1;
		if (start < s.length())
			return s.substring(i + lastWord.length() + 1);
		else
			return null;
	}

	// MD5 hash and convert to hex
	public static String MD5Hash(String original){
		MessageDigest md;
		try {
			md = MessageDigest.getInstance("MD5");
		} catch (NoSuchAlgorithmException e) {
			return null;
		}
		md.update(original.getBytes());
		byte[] digest = md.digest();
		StringBuffer sb = new StringBuffer();
		for (byte b : digest) {
			sb.append(Integer.toHexString((int) (b & 0xff)));
		}

		return sb.toString();
	}
	
	public static String calculateHash(String data) {
	    return DigestUtils.sha512Hex(data);
	}
	
	public static void main(String arg[]) {
		String s = retrieveLastId("http://localhost/api/dhcp", "clients");

		System.out.println(s);
		s = retrieveLastId("http://localhost/api/network", "network");
		System.out.println(s);
		
		System.out.println(MD5Hash("bhr4password"));
		s = retrieveId("http://localhost/api/wireless/1/client", "client");
		System.out.println(s);
		s = retrieveLastId("http://localhost/api/wireless/1", "wireless");
		System.out.println(s);

	}

}
