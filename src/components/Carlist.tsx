import { CarResponse } from "../types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import { getCars, deleteCar } from "../api/carapi";
import AddCar from "./AddCar";
import EditCar from "./EditCar";
import {
  DataGrid,
  GridColDef,
  GridCellParams,
  GridToolbar,
} from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

type CarlistProps = {
  logOut?: () => void;
};

function Carlist({ logOut }: CarlistProps) {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const { mutate } = useMutation(deleteCar, {
    onSuccess: () => {
      // Car deleted
      setOpen(true);
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const columns: GridColDef[] = [
    { field: "brand", headerName: "Brand", width: 200 },
    { field: "model", headerName: "Model", width: 200 },
    { field: "color", headerName: "Color", width: 200 },
    { field: "registrationNumber", headerName: "Reg.nr.", width: 150 },
    { field: "modelYear", headerName: "Model Year", width: 150 },
    { field: "price", headerName: "Price", width: 150 },
    {
      field: "edit",
      headerName: "",
      width: 90,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: GridCellParams) => <EditCar cardata={params.row} />,
    },
    {
      field: "delete",
      headerName: "",
      width: 90,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: GridCellParams) => (
        <IconButton
          aria-label="delete"
          size="small"
          onClick={() => {
            if (
              window.confirm(
                `Are you sure you want to delete ${params.row.brand} ${params.row.model}?`
              )
            ) {
              mutate(params.row._links.car.href);
            }
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const { data, error, isSuccess } = useQuery({
    queryKey: ["cars"],
    queryFn: getCars,
  });

  if (!isSuccess) {
    return <span>Loading . . .</span>;
  } else if (error) {
    return <span>Error when fetching cars!!</span>;
  } else {
    return (
      <>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <AddCar />
          <Button onClick={logOut}>Log out</Button>
        </Stack>
        <DataGrid
          rows={data as CarResponse[]}
          columns={columns}
          getRowId={(row) => row._links.self.href}
          disableRowSelectionOnClick={true}
          slots={{ toolbar: GridToolbar }}
        />
        <Snackbar
          open={open}
          autoHideDuration={2000}
          onClose={() => setOpen(false)}
          message="Car deleted"
        />
      </>
    );
  }

  return <></>;
}
export default Carlist;
