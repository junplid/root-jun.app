import { AxiosError } from "axios";
import { Controller } from "react-hook-form";
import Select from "react-select";

import { JSX, useEffect, useState } from "react";
import { api } from "../services/api";

interface ISelectComponent {
  name: string;
  control: any;
  defaultValue?: number[];
  isDisabled?: boolean;
}

interface IOptions {
  label: string;
  value: number;
}

export function SelectConnectionsComponent({
  isDisabled = false,
  ...props
}: ISelectComponent): JSX.Element | null {
  const [list, setList] = useState<IOptions[]>([]);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/root/connections-wa-options`);
        setList(
          data.connections.map((c: any) => ({ value: c.id, label: c.name })),
        );
        setLoad(true);
      } catch (error) {
        setLoad(true);
        if (error instanceof AxiosError) {
          console.error(error.response?.data);
        }
      }
    })();
  }, []);

  useEffect(() => {
    setLoad(false);
    setTimeout(() => {
      setLoad(true);
    }, 300);
  }, [props.defaultValue]);

  return load ? (
    <Controller
      {...props}
      render={({ field: { name, value, ref, onChange } }) => {
        return (
          <Select
            name={name}
            ref={ref}
            isDisabled={isDisabled}
            isLoading={!load}
            defaultValue={list.filter((c) =>
              props.defaultValue?.some((s) => s === c.value),
            )}
            placeholder={!load ? "Carregando..." : "Selecione"}
            onChange={(propsV) => onChange(propsV.map((s) => s.value))}
            value={list.find((c) => c.value === value)}
            styles={{
              container: (base, _props) => ({
                ...base,
                width: "100%",
              }),
              indicatorSeparator: (base, _props) => ({
                ...base,
                display: "none",
              }),
              control: (baseStyles, state) => ({
                ...baseStyles,
                borderColor: !state.isFocused ? "#3c3747" : "#757575",
                outlineColor: "#757575",
                borderWidth: 1.5,
                borderRadius: 6,
                backgroundColor: "transparent",
                transitionDuration: "0.2s",
              }),
              option: (base, _props) => ({
                ...base,
                color: "#000",
                fontSize: 14,
              }),
              singleValue: (base, _props) => ({
                ...base,
                color: "#fff",
                fontSize: 14,
              }),
              placeholder: (base, _props) => ({
                ...base,
                color: "#9babaf",
                fontSize: 14,
              }),
              valueContainer: (base, _props) => ({
                ...base,
                paddingLeft: 13,
              }),
              input: (base) => ({ ...base, color: "#dfe9eb" }),
              menu: (base) => ({ ...base, marginTop: "4px" }),
            }}
            theme={(theme) => ({
              ...theme,
              borderRadius: 2,
              colors: { ...theme.colors, primary: "#959595" },
            })}
            isMulti={true}
            isSearchable={true}
            className="select_type"
            noOptionsMessage={() => {
              return (
                <div className="flex flex-col gap-y-2">
                  <p className="text-slate-700 text-sm">
                    Nenhum conexão encontrada!
                  </p>
                </div>
              );
            }}
            options={list}
          />
        );
      }}
    />
  ) : null;
}
