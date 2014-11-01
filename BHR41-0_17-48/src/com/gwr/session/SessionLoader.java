package com.gwr.session;

import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gwr.api.devices.DevicesServlet;
import com.gwr.api.dhcp.DHCPServlet;
import com.gwr.api.diagnostics.DiagnosticsServlet;
import com.gwr.api.firewall.AccessControlServlet;
import com.gwr.api.firewall.FirewallServlet;
import com.gwr.api.firewall.LogSettingsServlet;
import com.gwr.api.firewall.PortForwardServlet;
import com.gwr.api.firewall.PortTriggerServlet;
import com.gwr.api.firewall.StaticNatServlet;
import com.gwr.api.firmware.FirmwareServlet;
import com.gwr.api.network.NetworkServlet;
import com.gwr.api.parental.ParentalServlet;
import com.gwr.api.settings.ARPTableServlet;
import com.gwr.api.settings.DNSServerServlet;
import com.gwr.api.settings.DateTimeServlet;
import com.gwr.api.settings.DdnsServlet;
import com.gwr.api.settings.DdnsprovidersServlet;
import com.gwr.api.settings.EthernetServlet;
import com.gwr.api.settings.IGMPAclServlet;
import com.gwr.api.settings.IGMPHostsServlet;
import com.gwr.api.settings.IGMPIntfServlet;
import com.gwr.api.settings.IGMPProxyServlet;
import com.gwr.api.settings.IPV6Servlet;
import com.gwr.api.settings.LocalAdminServlet;
import com.gwr.api.settings.LogServlet;
import com.gwr.api.settings.MacCloningServlet;
import com.gwr.api.settings.NetworkObjectsServlet;
import com.gwr.api.settings.PortForwardRulesServlet;
import com.gwr.api.settings.RemoteAdminServlet;
import com.gwr.api.settings.RestoreDefaultServlet;
import com.gwr.api.settings.RoutesServlet;
import com.gwr.api.settings.SchedulesServlet;
import com.gwr.api.settings.SystemServlet;
import com.gwr.api.settings.UPNPServlet;
import com.gwr.api.users.UsersServlet;
import com.gwr.api.wireless.WirelessServlet;
import com.gwr.util.JsonProperties;
import com.gwr.util.json.SimToUIJSONModelListResponse;
import com.gwr.util.json.SimToUIJSONModelResponse;
import com.gwr.util.json.UIToSimModelListRequest;
import com.gwr.util.json.UIToSimModelRequest;

/**
 * 
 * @author jerry skidmore
 * 
 */
public class SessionLoader {
	protected final static Logger logger = LoggerFactory
			.getLogger(SessionLoader.class);

	// The session here isn't cached - this class is an instance variable that
	// is created once upon
	// logging in and never used again, so this isn't breaking any rules or
	// "best practices"
	private HttpSession session;

	public SessionLoader(HttpSession session) {
		this.session = session;
	}

	private void loadListJSON(String servletName, String json) {
		UIToSimModelListRequest req = new UIToSimModelListRequest(json);
		SimToUIJSONModelListResponse res = new SimToUIJSONModelListResponse();
		res.setModelList(req.getModelList());

		this.session.setAttribute(servletName, res.toJSON());
	}

	private void loadJSON(String servletName, String json) {
		UIToSimModelRequest req = new UIToSimModelRequest(json);
		SimToUIJSONModelResponse res = new SimToUIJSONModelResponse();
		res.setModel(req.getJsonDataModel());

		this.session.setAttribute(servletName, res.toJSON());
	}

	public void loadDefaultRouterJSONInToSession() {

		logger.info("Loading data into session: " + session.getId());
		// devices
		this.loadListJSON(DevicesServlet.class.getSimpleName(),
				JsonProperties.getDevicesJSON());
		// dhcp
		this.loadJSON(DHCPServlet.class.getSimpleName(),
				JsonProperties.getDHCPJSON());
		this.loadListJSON(DHCPServlet.DHCPClients,
				JsonProperties.getDHCPClientsJSON());
		this.loadListJSON(DHCPServlet.DHCPOptions,
				JsonProperties.getDHCPOptionsJSON());

		// firmware
		this.loadJSON(FirmwareServlet.class.getSimpleName(),
				JsonProperties.getFirmwareJSON());

		// network
		this.loadListJSON(NetworkServlet.class.getSimpleName(),
				JsonProperties.getNetworkJSON());

		// wireless
		this.loadListJSON(WirelessServlet.class.getSimpleName(),
				JsonProperties.getWirelessJSON());
		// each only has 0/1 device
		this.loadJSON(WirelessServlet.TRAKEY + "0",
				JsonProperties.getWirelessTransmission0JSON());
		this.loadJSON(WirelessServlet.TRAKEY + "1",
				JsonProperties.getWirelessTransmission1JSON());
		// each only has 0/1 device
		this.loadJSON(WirelessServlet.QOSKEY + "0",
				JsonProperties.getWirelessQos0JSON());
		this.loadJSON(WirelessServlet.QOSKEY + "1",
				JsonProperties.getWirelessQos1JSON());
		// each only has 0/1 device
		this.loadJSON(WirelessServlet.MACKEY + "0",
				JsonProperties.getWirelessMacfilter0JSON());
		this.loadJSON(WirelessServlet.MACKEY + "1",
				JsonProperties.getWirelessMacfilter1JSON());
		// each only has 0/1 device
		this.loadJSON(WirelessServlet.WPSKEY + "0",
				JsonProperties.getWirelessWpsJSON());
		this.loadJSON(WirelessServlet.WPSKEY + "1",
				JsonProperties.getWirelessWpsJSON());

		// settings
		this.loadJSON(LocalAdminServlet.class.getSimpleName(),
				JsonProperties.getSettingsLocalAdminJSON());
		this.loadJSON(RemoteAdminServlet.class.getSimpleName(),
				JsonProperties.getSettingsRemoteAdminJSON());
		this.loadJSON(SystemServlet.class.getSimpleName(),
				JsonProperties.getSettingsSystemJSON());
		this.loadJSON(DateTimeServlet.class.getSimpleName(),
				JsonProperties.getSettingsDateTimeJSON());
		this.loadJSON(MacCloningServlet.class.getSimpleName(),
				JsonProperties.getSettingsMacCloningJSON());
		this.loadListJSON(SchedulesServlet.class.getSimpleName(),
				JsonProperties.getSettingsSchedulesJSON());
		this.loadJSON(IPV6Servlet.class.getSimpleName(),
				JsonProperties.getSettingsIPV6JSON());
		this.loadListJSON(DNSServerServlet.class.getSimpleName(),
				JsonProperties.getSettingsDNSServerJSON());
		this.loadListJSON(ARPTableServlet.class.getSimpleName(),
				JsonProperties.getSettingsARPTableJSON());
		this.loadListJSON(NetworkObjectsServlet.class.getSimpleName(),
				JsonProperties.getSettingsNetworkObjectsJSON());
		this.loadListJSON(PortForwardRulesServlet.class.getSimpleName(),
				JsonProperties.getSettingsPortFowardRulesJSON());
		this.loadJSON(EthernetServlet.class.getSimpleName(),
				JsonProperties.getSettingsEthernetJSON());
//		this.loadListJSON(RoutesServlet.class.getSimpleName(),
//				JsonProperties.getSettingsRoutesJSON());
		this.loadJSON(RoutesServlet.class.getSimpleName(),
				JsonProperties.getSettingsRoutesJSON());
		this.loadListJSON(DdnsServlet.class.getSimpleName(),
				JsonProperties.getSettingsDdnsJSON());
		this.loadListJSON(DdnsprovidersServlet.class.getSimpleName(),
				JsonProperties.getSettingsDdnsprovidersJSON());
		this.loadJSON(RestoreDefaultServlet.class.getSimpleName(),
				JsonProperties.getSettingsDefaultsJSON());

		// special handle because it is not json
		for (int i = 0; i <= 5; i++) {
			this.session.setAttribute(LogServlet.class.getSimpleName() + i,
					JsonProperties.getSampleLog(i));
		}

		this.loadJSON(UPNPServlet.class.getSimpleName(),
				JsonProperties.getSettingsUPNPJSON());
		this.loadJSON(IGMPProxyServlet.class.getSimpleName(),
				JsonProperties.getSettingsIGMPProxyJSON());
		this.loadJSON(IGMPAclServlet.class.getSimpleName(),
				JsonProperties.getSettingsIGMPAclJSON());
		this.loadListJSON(IGMPHostsServlet.class.getSimpleName(),
				JsonProperties.getSettingsIGMPHostsJSON());
		this.loadJSON(IGMPIntfServlet.class.getSimpleName(),
				JsonProperties.getSettingsIGMPIntfJSON());

		// user
		this.loadJSON(UsersServlet.class.getSimpleName(),
				JsonProperties.getUsersJSON());

		// firewall
		this.loadJSON(FirewallServlet.class.getSimpleName(),
				JsonProperties.getFirewallJSON());
		this.loadListJSON(AccessControlServlet.class.getSimpleName(),
				JsonProperties.getFirewallAccessControlJSON());
		this.loadListJSON(PortForwardServlet.class.getSimpleName(),
				JsonProperties.getFirewallPortFowardJSON());
		this.loadListJSON(PortTriggerServlet.class.getSimpleName(),
				JsonProperties.getFirewallPortTriggerJSON());
		this.loadListJSON(StaticNatServlet.class.getSimpleName(),
				JsonProperties.getFirewallStaticNatJSON());
		this.loadJSON(LogSettingsServlet.class.getSimpleName(),
				JsonProperties.getFirewallLogSettingsJSON());

		// parental
		this.loadListJSON(ParentalServlet.class.getSimpleName(),
				JsonProperties.getParentalJSON());

		// Diagnostics
		this.loadJSON(DiagnosticsServlet.class.getSimpleName(),
				JsonProperties.getDiagnosticsJSON());

	}
}
