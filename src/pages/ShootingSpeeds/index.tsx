import { AxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import { api } from "../../services/api";
import { calculateDailyShots } from "../../utils/calculateDailyShots";

interface ShootingSpeedField {
  name: string;
  timeBetweenShots: number;
  timeRest: number;
  numberShots: number;
  sequence: number;
  status?: boolean;
}

export const ShootingSpeedsPage: React.FC = (): JSX.Element => {
  const [fields, setFields] = useState<ShootingSpeedField>(
    {} as ShootingSpeedField
  );
  const [shootingSpeeds, setShootingSpeeds] = useState<
    {
      id: number;
      name: string;
      sequence: number;
      shootingPerDay: number;
      status: boolean;
    }[]
  >([]);
  const [editInterval, setEditInterval] = useState<number>(0);
  const [cookies] = useCookies(["auth_root"]);

  const shotsPerDay = useMemo(() => {
    if (fields.numberShots && fields.timeRest && fields.timeBetweenShots) {
      return calculateDailyShots({
        numberShots: fields.numberShots,
        timeBetweenShots: fields.timeBetweenShots,
        timeRest: fields.timeRest,
      });
    }
    return 0;
  }, [fields.numberShots, fields.timeBetweenShots, fields.timeRest]);

  const create = useCallback(async () => {
    try {
      await api.post("/root/shooting-speed", fields, {
        headers: { Authorization: cookies.auth_root },
      });
      setFields({} as ShootingSpeedField);
      const { data } = await api.get("/root/shooting-speeds", {
        headers: { Authorization: cookies.auth_root },
      });
      setShootingSpeeds(data.shootingSpeeds);
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(error.response?.data.details[0].message);
        return;
      }
    }
  }, [fields]);

  const get = useCallback(async (id: number) => {
    try {
      const { data } = await api.get(`/root/shooting-speed/${id}`, {
        headers: { Authorization: cookies.auth_root },
      });
      setFields(data.shootingSpeed);
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(error.response?.data.details[0].message);
        return;
      }
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/root/shooting-speeds", {
          headers: { Authorization: cookies.auth_root },
        });
        setShootingSpeeds(data.shootingSpeeds);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.data.detail?.[0]?.message) {
            alert(error.response?.data.detail[0].message);
            return;
          }
          console.log(error.response?.data);
          return;
        }
        alert("Deu error!");
        console.log(error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!editInterval) {
      setFields({
        status: true,
      } as ShootingSpeedField);
    }
  }, [editInterval]);

  const update = useCallback(
    async (id: number) => {
      try {
        // @ts-expect-error
        const { shotsPerDay, ...rest } = fields;
        await api.put(`/root/shooting-speed/${id}`, undefined, {
          headers: { Authorization: cookies.auth_root },
          params: rest,
        });
        setShootingSpeeds((rages) =>
          rages.map((range) => {
            if (range.id === id) {
              for (const [key, value] of Object.entries(fields)) {
                // @ts-expect-error
                range[key] = value;
              }
            }
            return range;
          })
        );
        setEditInterval(0);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 400) {
            alert(error.response?.data.message);
            return;
          }
        }
      }
    },
    [cookies, fields]
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Velocidade de disparos
        </h1>
        <p className="text-gray-700 text-lg">
          Quantidade de velocidades:{" "}
          <span className="font-bold text-gray-900">
            {shootingSpeeds.length}
          </span>
        </p>
        <p className="text-gray-700 text-lg">
          Intervalos ativos:{" "}
          <span className="text-blue-600 font-bold">
            {shootingSpeeds.reduce((ac, obj) => ac + (obj.status ? 1 : 0), 0)}
          </span>
        </p>
      </div>
      <section className="flex flex-col gap-y-6 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {editInterval ? "Editar intervalo" : "Criar intervalo"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editInterval) {
              update(editInterval);
            } else {
              create();
            }
          }}
          className="flex flex-col gap-4 bg-white rounded-2xl shadow p-8 border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              onChange={({ target }) =>
                setFields((f) => ({ ...f, name: target.value }))
              }
              value={fields.name || ""}
              className="p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
              name="name"
              type="text"
              placeholder="Nome"
            />
            <input
              onChange={({ target }) =>
                setFields((f) => ({ ...f, sequence: Number(target.value) }))
              }
              value={fields.sequence || ""}
              className="p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
              name="sequence"
              type="number"
              placeholder="Sequência"
            />
            <input
              onChange={({ target }) =>
                setFields((f) => ({ ...f, numberShots: Number(target.value) }))
              }
              value={fields.numberShots || ""}
              className="p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
              name="numberShots"
              type="number"
              placeholder="Quantidade de disparos"
            />
            <input
              onChange={({ target }) =>
                setFields((f) => ({
                  ...f,
                  timeBetweenShots: Number(target.value),
                }))
              }
              value={fields.timeBetweenShots || ""}
              className="p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
              name="timeBetweenShots"
              type="number"
              placeholder="Delay entre disparos (segundos)"
            />
            <input
              onChange={({ target }) =>
                setFields((f) => ({ ...f, timeRest: Number(target.value) }))
              }
              value={fields.timeRest || ""}
              className="p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
              name="timeRest"
              type="number"
              placeholder="Tempo de descanso (segundos)"
            />
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-8 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={fields.status === true}
                    onChange={() => setFields((f) => ({ ...f, status: true }))}
                  />
                  <span>Ativo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={fields.status === false}
                    onChange={() => setFields((f) => ({ ...f, status: false }))}
                  />
                  <span>Desativado</span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-2">
            <div>
              <p className="text-gray-600 text-sm">
                Média diária de disparos com uma conexão:{" "}
                <span className="font-bold text-blue-600">{shotsPerDay}</span>
              </p>
              <p className="text-gray-600 text-sm">
                Média HORA de disparos com uma conexão:{" "}
                <span className="font-bold text-blue-600">
                  {shotsPerDay / 24}
                </span>
              </p>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              {editInterval ? (
                <button
                  type="button"
                  className="p-3 rounded-lg text-white bg-red-500 hover:bg-red-600 transition font-bold"
                  onClick={() => setEditInterval(0)}
                >
                  Cancelar edição
                </button>
              ) : null}
              <button
                type="submit"
                className="p-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition font-bold"
              >
                {editInterval ? "Salvar edição" : "Criar intervalo"}
              </button>
            </div>
          </div>
        </form>
      </section>
      <section className="flex flex-col gap-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Lista de intervalos
        </h2>
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...shootingSpeeds]
            .sort((a, b) => a.sequence - b.sequence)
            .map((item) => (
              <article
                key={item.id}
                className="flex flex-col duration-200 border border-gray-200 bg-white rounded-2xl shadow hover:scale-[1.02] hover:shadow-lg transition-transform min-h-[220px]"
              >
                <div
                  className="p-6 flex-1 flex flex-col gap-1 cursor-pointer group-hover:bg-gray-50"
                  title="visualizar"
                >
                  <p className="text-xs text-gray-400">ID: {item.id}</p>
                  <p className="text-gray-600 text-sm">
                    Status:{" "}
                    <span
                      className={
                        item.status ? "text-blue-600" : "text-gray-400"
                      }
                    >
                      {item.status ? "Ativo" : "Desativado"}
                    </span>
                  </p>
                  <h2 className="text-lg font-bold text-gray-900 mt-2 mb-1">
                    {item.name}
                  </h2>
                  <p className="text-gray-700 text-sm">
                    Sequência: {item.sequence}
                  </p>
                  <p className="text-gray-700 text-sm">
                    Qtd. disparos por dia: {item.shootingPerDay}
                  </p>
                  <p className="text-gray-700 text-sm">
                    Qtd. disparos por HR ~
                    {(item.shootingPerDay / 24).toFixed(0)}
                  </p>
                </div>
                <div className="flex gap-2 p-4">
                  <button
                    onClick={async () => {
                      await get(item.id);
                      setEditInterval(item.id);
                    }}
                    className="w-full p-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
                  >
                    Editar
                  </button>
                </div>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
};
