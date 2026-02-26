import { JSX, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import { AxiosError } from "axios";
import { SocketContext } from "../../contexts/contexts";
import moment from "moment";
import { Column, TableComponent } from "../../components/Table";

interface Log {
  type: "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";
  hash: string;
  entity: string;
  value: string;
}

export const GeralLogsPage: React.FC = (): JSX.Element => {
  const { socket } = useContext(SocketContext);
  const [logs, setLogs] = useState<Log[]>([]);
  const [load, setLoad] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/root/geral-logs");
        setLogs(data.logs);
        setLoad(true);
      } catch (error) {
        if (error instanceof AxiosError) {
          alert(error.response?.data.message);
        }
      }
    })();
  }, []);

  useEffect(() => {
    socket.on("geral-logs", (log: Log) => setLogs((l) => [log, ...l]));
  }, [socket]);

  const renderColumns = useMemo(() => {
    const columns: Column[] = [
      {
        key: "type",
        name: "Tipo",
      },
      {
        key: "entity",
        name: "Entidade",
      },
      {
        key: "value",
        name: "Texto",
      },
      {
        key: "createAt",
        name: "Data de criação",
        styles: { width: 165 },
        render(row) {
          return (
            <div className="flex flex-col">
              <span>{moment(row.createAt).format("D/M/YY HH:mm")}</span>
            </div>
          );
        },
      },
    ];
    return columns;
  }, []);

  return (
    <div className="flex-1 h-full gap-y-1 flex flex-col w-full">
      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
        Logs Geral
      </h2>
      <div
        style={{ maxHeight: "calc(100vh - 180px)" }}
        className="grid flex-1 w-full"
      >
        <TableComponent
          rows={logs || []}
          columns={renderColumns}
          textEmpity="Seus logs aparecerão aqui."
          load={!load}
        />
      </div>
    </div>
  );
};
