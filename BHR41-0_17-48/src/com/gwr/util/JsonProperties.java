package com.gwr.util;

import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * @author jerry skidmore
 * 
 */
public class JsonProperties {
	private final static Logger logger = LoggerFactory
			.getLogger(JsonProperties.class);

	private static Properties properties;

	static {
		try {
			properties = PropertiesLoader
					.load("defaultRouterConfig.properties");

		} catch (Exception e) {
			logger.error("Could not find/load the defaultRouterConfig.properties file");

			properties = new Properties();
		}
	}

	/**
	 * start load property
	 */
	// devices
	public static final String getDevicesJSON() {
		return properties.getProperty("devices.json");
	}

	// DHCP
	public static String getDHCPJSON() {
		return properties.getProperty("dhcp.json");
	}

	public static String getDHCPClientsJSON() {
		return properties.getProperty("dhcp.clients.json");
	}

	// firmware
	public static final String getFirmwareJSON() {
		return properties.getProperty("firmware.json");
	}

	// network
	public static final String getNetworkJSON() {
		return properties.getProperty("network.json");
	}

	// wireless
	public static final String getWirelessJSON() {
		return properties.getProperty("wireless.json");
	}

	public static String getWirelessTransmissionJSON(String ids) {
		return properties.getProperty(ids + ".json");
	}
	public static String getWirelessTransmission0JSON() {
		return properties.getProperty("wireless.transmission0.json");
	}
	public static String getWirelessTransmission1JSON() {
		return properties.getProperty("wireless.transmission1.json");
	}

	public static String getWirelessQosJSON(String id) {
		return properties.getProperty(id + ".json");
	}
	public static String getWirelessQos0JSON() {
		return properties.getProperty("wireless.qos0.json");
	}
	public static String getWirelessQos1JSON() {
		return properties.getProperty("wireless.qos1.json");
	}
	public static String getWirelessMacfilterJSON() {
		return properties.getProperty("wireless.macfilter.json");
	}

	public static String getWirelessWpsJSON() {
		return properties.getProperty("wireless.wps.json");
	}

	public static String getSettingsLocalAdminJSON() {
		return properties.getProperty("settings.localadmin.json");
	}

	public static String getSettingsRemoteAdminJSON() {
		return properties.getProperty("settings.remoteadmin.json");
	}

	public static String getSettingsSystemJSON() {
		return properties.getProperty("settings.system.json");
	}

	public static String getSettingsDateTimeJSON() {
		return properties.getProperty("settings.datetime.json");
	}

	public static final String getSettingsMacCloningJSON() {
		return properties.getProperty("settings.maccloning.json");
	}

	public static String getSettingsSchedulesJSON() {
		return properties.getProperty("settings.schedules.json");
	}

	public static String getSettingsDefaultsJSON() {
		return properties.getProperty("settings.defaults.json");
	}

	public static String getSettingsDdnsprovidersJSON() {
		return properties.getProperty("settings.ddnsproviders.json");
	}
	
	public static String getSettingsIPV6JSON() {
		return properties.getProperty("settings.ipv6.json");
	}

	public static String getSettingsDNSServerJSON() {
		return properties.getProperty("settings.dnsserver.json");
	}

	public static final String getSettingsARPTableJSON() {
		return properties.getProperty("settings.arptable.json");
	}

	public static String getSettingsNetworkObjectsJSON() {
		return properties.getProperty("settings.networkobjects.json");
	}

	public static String getSettingsPortFowardRulesJSON() {
		return properties.getProperty("settings.portforwardrules.json");
	}

	public static String getSettingsEthernetJSON() {
		return properties.getProperty("settings.ethernet.json");
	}

	public static String getSettingsRoutesJSON() {
		return properties.getProperty("settings.routes.json");
	}

	public static String getSettingsDdnsJSON() {
		return properties.getProperty("settings.ddns.json");
	}

	public static String getSettingsUPNPJSON() {
		return properties.getProperty("settings.upnp.json");
	}

	public static String getSettingsIGMPProxyJSON() {
		return properties.getProperty("settings.igmpproxy.json");
	}

	public static String getSettingsIGMPAclJSON() {
		return properties.getProperty("settings.igmpacl.json");
	}

	public static String getSettingsIGMPHostsJSON() {
		return properties.getProperty("settings.igmphosts.json");
	}

	public static String getSettingsIGMPIntfJSON() {
		return properties.getProperty("settings.igmpintf.json");
	}

	// user
	public static final String getUsersJSON() {
		return properties.getProperty("users.json");
	}

	// firewall
	public static final String getFirewallJSON() {
		return properties.getProperty("firewall.json");
	}

	public static String getFirewallAccessControlJSON() {
		return properties.getProperty("firewall.accesscontrol.json");
	}

	public static String getFirewallPortFowardJSON() {
		return properties.getProperty("firewall.portforward.json");
	}

	public static String getFirewallPortTriggerJSON() {
		return properties.getProperty("firewall.porttrigger.json");
	}

	public static String getFirewallStaticNatJSON() {
		return properties.getProperty("firewall.staticnat.json");
	}

	public static String getFirewallLogSettingsJSON() {
		return properties.getProperty("firewall.log.settings.json");
	}

	// parental
	public static String getParentalJSON() {
		return properties.getProperty("parental.json");
	}

	// setting log
	public static String getSampleLog(int i) {
		return properties.getProperty("settings.log." + i);
	}
		
	// login failed
	public static String getLoginFailJSON(){
		return properties.getProperty("login.fail");	
	}

	// Diagnostics
	public static String getDiagnosticsJSON() {
		return properties.getProperty("diagnostics.json");
	}

}