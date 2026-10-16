import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { MQTT_COMMANDS } from "../constants/mqttCommands";

export default function MqttViewer({
  deviceId,
  serial
}) {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlDeviceId =
    searchParams.get("deviceId") || "";

  const urlSerial =
    searchParams.get("serial") || "";

  const [selectedDeviceId, setSelectedDeviceId] =
    useState(urlDeviceId);

  const activeDevice =
    deviceId ||
    selectedDeviceId ||
    urlDeviceId;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [topic, setTopic] = useState("");
  const [payload, setPayload] = useState("");
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("");

  const [selectedCommand, setSelectedCommand] =
    useState("get_status");

  const [mode, setMode] =
    useState("rtu");

  // =========================
  // FETCH MQTT DATA
  // =========================

  const fetchData = async () => {
    try {
      setLoading(true);

      const response =
        await api.get("/mqtt/data");

      if (response.data.success) {
        setMessages(
          response.data.messages || []
        );
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SEND RTU COMMAND
  // =========================

  const sendRTUCommand = async () => {

    if (!activeDevice) {
      setSendStatus(
        "❌ No Device Selected"
      );
      return;
    }

    const command =
      MQTT_COMMANDS.find(
        c => c.cmd === selectedCommand
      );

    if (!command) {
      setSendStatus(
        "❌ Invalid Command"
      );
      return;
    }

    const mqttTopic =
      `qespl/rtu/${activeDevice}/${command.topic}`;

    const message = {
      msg_id: Date.now().toString(),
      cmd: command.cmd
    };

    try {

      setSending(true);

      const response =
        await api.post(
          "/mqtt/publish",
          {
            topic: mqttTopic,
            message
          }
        );

      if (response.data.success) {
        setSendStatus(
          "✅ Command Sent"
        );
        fetchData();
      }

    } catch (err) {

      console.error(err);

      setSendStatus(
        "❌ Command Failed"
      );

    } finally {

      setSending(false);

    }
  };

  // =========================
  // SEND MANUAL MQTT
  // =========================

  const sendManualMessage = async () => {

    if (!topic) {
      setSendStatus(
        "❌ Topic Required"
      );
      return;
    }

    try {

      setSending(true);

      let parsedPayload;

      try {
        parsedPayload =
          JSON.parse(payload);
      } catch {
        parsedPayload =
          payload;
      }

      const response =
        await api.post(
          "/mqtt/publish",
          {
            topic,
            message: parsedPayload
          }
        );

      if (response.data.success) {

        setSendStatus(
          "✅ Manual Message Sent"
        );

        fetchData();
      }

    } catch (err) {

      console.error(err);

      setSendStatus(
        "❌ Manual Send Failed"
      );

    } finally {

      setSending(false);

    }
  };

  // =========================
  // FILTER DEVICE MESSAGES
  // =========================

  const filteredMessages =
    activeDevice
      ? messages.filter(msg =>
        msg.topic?.includes(activeDevice)
      )
      : messages;
  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="bg-gray-800 rounded-xl p-5 mb-5 border border-gray-700">
          <div className="flex justify-between items-center mb-4">

            <button
              onClick={() => navigate(-1)}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm"
            >
              ← Back
            </button>

            <button
              onClick={fetchData}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
            >
              Refresh
            </button>

          </div>
          <h1 className="text-3xl font-bold">
            MQTT Dashboard
          </h1>

          <p className="text-gray-400 mt-2">
            Receive and send MQTT messages
          </p>

          {activeDevice && (
            <div className="mt-3 text-sm text-green-400">
              Device :
              {" "}
              {activeDevice}
            </div>
          )}

          {urlSerial && (
            <div className="text-sm text-blue-400">
              Serial :
              {" "}
              {urlSerial}
            </div>
          )}
        </div>

        {/* STATUS */}

        <div className="bg-gray-800 rounded-xl p-4 mb-5 border border-gray-700">

          <div className="flex items-center gap-3 flex-wrap">

            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />

            <span>
              Connected
            </span>

            <span className="text-blue-400">
              Messages:
              {" "}
              {filteredMessages.length}
            </span>

            <button
              onClick={fetchData}
              className="ml-auto bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              Refresh
            </button>

          </div>
        </div>

        {/* MODE SWITCH */}

        <div className="bg-gray-800 rounded-xl p-4 mb-5 border border-gray-700 flex gap-3">

          <button
            onClick={() => setMode("rtu")}
            className={`px-4 py-2 rounded ${mode === "rtu"
              ? "bg-blue-600"
              : "bg-gray-700"
              }`}
          >
            RTU Commands
          </button>

          <button
            onClick={() => setMode("manual")}
            className={`px-4 py-2 rounded ${mode === "manual"
              ? "bg-green-600"
              : "bg-gray-700"
              }`}
          >
            Manual MQTT
          </button>

        </div>

        {/* SEND PANEL */}

        <div className="bg-gray-800 rounded-xl p-5 mb-5 border border-gray-700">

          <h2 className="text-xl font-semibold mb-4">
            Send MQTT Message
          </h2>

          {/* DEVICE ID */}

          <div className="mb-4">
            <label className="block mb-2 text-sm text-gray-400">
              Device ID
            </label>

            <input
              type="text"
              value={selectedDeviceId}
              onChange={(e) =>
                setSelectedDeviceId(
                  e.target.value
                )
              }
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
            />
          </div>

          {/* RTU COMMANDS */}

          {mode === "rtu" && (

            <div className="mb-4">

              <label className="block mb-2 text-sm text-gray-400">
                Command
              </label>

              <select
                value={selectedCommand}
                onChange={(e) =>
                  setSelectedCommand(
                    e.target.value
                  )
                }
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
              >
                {MQTT_COMMANDS.map(cmd => (
                  <option
                    key={cmd.cmd}
                    value={cmd.cmd}
                  >
                    {cmd.label}
                  </option>
                ))}
              </select>

            </div>
          )}

          {/* MANUAL MQTT */}

          {mode === "manual" && (
            <>
              <div className="mb-4">
                <label className="block mb-2 text-sm text-gray-400">
                  Topic
                </label>

                <input
                  value={topic}
                  onChange={(e) =>
                    setTopic(
                      e.target.value
                    )
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm text-gray-400">
                  Payload
                </label>

                <textarea
                  rows={6}
                  value={payload}
                  onChange={(e) =>
                    setPayload(
                      e.target.value
                    )
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 font-mono"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-4">

            <button
              onClick={
                mode === "rtu"
                  ? sendRTUCommand
                  : sendManualMessage
              }
              disabled={sending}
              className={`px-6 py-3 rounded-lg ${sending
                ? "bg-gray-700"
                : "bg-green-600 hover:bg-green-700"
                }`}
            >
              {sending
                ? "Sending..."
                : "Send"}
            </button>

            {sendStatus && (
              <span>
                {sendStatus}
              </span>
            )}

          </div>

        </div>

        {/* MESSAGE LIST */}

        <div className="space-y-4">

          {filteredMessages.map(
            (msg, idx) => (

              <div
                key={idx}
                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700"
              >

                <div className="bg-gray-900 px-4 py-3 border-b border-gray-700">

                  <div className="flex justify-between items-center flex-wrap gap-2">

                    <div className="flex items-center gap-2">

                      <span className="text-blue-400 font-mono">
                        📡 {msg.topic}
                      </span>

                      <span className="bg-blue-600 text-xs px-2 py-1 rounded">
                        {msg.messageType || "unknown"}
                      </span>

                    </div>

                    <span className="text-xs text-gray-500">
                      {msg.timestamp
                        ? new Date(
                          msg.timestamp
                        ).toLocaleString()
                        : "N/A"}
                    </span>

                  </div>

                </div>

                <div className="p-4">

                  <pre className="text-green-400 text-sm whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(
                      msg.data,
                      null,
                      2
                    )}
                  </pre>

                </div>

              </div>

            )
          )}

        </div>

        {!loading &&
          filteredMessages.length === 0 && (
            <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700 mt-5">

              <p className="text-gray-400">
                No MQTT messages found
              </p>

            </div>
          )}

      </div>
    </div>
  );
}