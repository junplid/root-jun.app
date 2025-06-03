import { useMemo } from "react";
// import { ViewBottomTableComponent } from "./ViewBottom";
import "./styles.scss";
import { v4 } from "uuid";

export interface Column {
  name: string;
  key: string | number;
  styles?: { width?: number };
  render?: (row: Rows) => JSX.Element | string;
}

type Rows = { [x: string]: string | number | any };

interface Props {
  columns: Column[];
  rows: Rows[];
  textEmpity?: string;
}

interface RowColumnOrdened {
  id: number;
  columns: ({
    key: string;
    value: string | JSX.Element;
  } | null)[];
}

export const TableComponent = (props: Props): JSX.Element => {
  const rows: RowColumnOrdened[] = useMemo(() => {
    return props.rows.map((row) => {
      const columns = props.columns.map((column) => {
        let objRow: {
          key: string;
          value: JSX.Element | string;
        } | null = null;

        for (const rowObj of Object.entries(row)) {
          const [key, value] = rowObj;
          if (column.render) {
            return (objRow = {
              key: v4(),
              value: column.render(row),
            });
          }
          if (key === column.key) return (objRow = { key, value });
        }
        return objRow;
      });
      return { id: row.id, columns: columns.filter((s) => s) };
    });
  }, [props.columns, props.rows]);

  return (
    <div className="scroll-custom-table h-full overflow-y-auto">
      <table className="min-w-full table-auto">
        <thead
          style={{ height: 50 }}
          className="head-table sticky top-0 bg-gray-200 shadow-md"
        >
          <tr>
            {props.columns.map((column) => (
              <th
                key={column.key}
                align="left"
                className="select-none px-4 py-2 text-sm font-normal"
                style={{ width: column.styles?.width }}
              >
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!!rows.length &&
            rows.map((row) => {
              return (
                <tr
                  key={row.id}
                  style={{ height: 45 }}
                  className="duration-[140ms] odd:bg-[#92929217] even:bg-[#6b6b6b13] hover:bg-[#9292922d]"
                >
                  {row.columns.map((column) => {
                    if (column !== null) {
                      return (
                        <td
                          key={row.id + column.key}
                          aria-details=""
                          className="cursor-default px-4 py-2"
                          style={{ fontSize: 13 }}
                        >
                          {column.value === typeof "string" ? (
                            <span className="line-clamp-1">{column.value}</span>
                          ) : (
                            column.value
                          )}
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
          {/* {!!rows.length && <ViewBottomTableComponent />} */}
          {!rows.length && props.textEmpity && (
            <tr>
              <td
                colSpan={props.columns.length}
                align="center"
                className="cursor-default px-4 py-2 text-sm text-white/70"
              >
                {props.textEmpity}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
