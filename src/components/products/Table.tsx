import React from "react";
import { Prisma, Product } from "@prisma/client";
import { GlobalCtx } from "../../contexts/Global";

import DataTable, { TableColumn } from "react-data-table-component";

import { ProductApi } from "../../types/product";
import { api } from "../../utils/api";
import { formatBr } from "../../utils/formatDate";
import { customStylesTable } from "../../utils/table";
import StructureTable from "../elements/Table";
import ContentModalProduct from "./ContentModal";
import generatePdf from "../../utils/generatePdf";

type TableProductsProps = {
    products: ProductApi[]
}

type DataRow = ProductApi;

type SelectedRowsChange<T> = {
    allSelected: boolean;
    selectedCount: number;
    selectedRows: T[]
}

const columns: TableColumn<DataRow>[] = [
    {
      name: 'Id',
      selector: (row) => row.id,
      sortable: true,
      width: '7%'
    },
    {
      name: 'Nome',
      selector: (row) => row.name,
      sortable: true,
      width: '20%'
    },
    {
        name: 'Categoria',
        selector: (row) => row.category.name,
        sortable: true,
    },
    {
        name: 'Quantidade',
        selector: (row) => row.amount,
        sortable: true,
    },
    {
        name: 'Data de compra',
        selector: (row) => formatBr(new Date(row.register)),
    },
    {
        name: 'Preço de compra',
        selector: (row) => row.purchasePrice,
        sortable: true,
    },
    {
      name: 'Preço de venda',
      selector: (row) => row.saleValue,
      sortable: true,
      width: '12%'
    }
];

const TableProducts = ({ products }: TableProductsProps) => {
    const { setProducts, products: productsCtx, setNotify, setContentModal, setShowModal, setRefresh } = React.useContext(GlobalCtx);

    React.useEffect(() => setProducts(products), []);

    const [selectedRows, setSelectedRows] = React.useState<DataRow[]>([]);
    const handleChange = ({ selectedRows }: SelectedRowsChange<DataRow>) => setSelectedRows(selectedRows);

    const handleDeleteProduct = async () => {
        if(!selectedRows[0]) return;
        const { id } = selectedRows[0];

        await api.delete<Product, {id: number}>(`product/${id}`);
        setRefresh(true);
        setNotify({
            show: true,
            type: 'success'
        });
        setSelectedRows([]); 
    }

    const handleDeleteProducts = async () => {
        const ids = selectedRows.map(({id}) => id);

        await api.delete<Prisma.BatchPayload, {ids: number[]}>("product", {ids});
        setRefresh(true);
        setNotify({
            show: true,
            type: 'success'
        });
        setSelectedRows([]);   
    }

    const handleEditProduct = () => {
        if(!selectedRows[0]) return;

        setContentModal(<ContentModalProduct type="update" productSelect={selectedRows[0]}/>)
        setShowModal(true);
    }

    const handleViewProduct = () => {
        if(!selectedRows[0]) return;

        setContentModal(<ContentModalProduct type="view" productSelect={selectedRows[0]}/>);
        setShowModal(true);
    }

    const generatePdfProducts = () => {
        const heads = ['Id', 'Nome', 'Categoria', 'Quantidade', 'Data de compra', 'Preço de compra', 'Preço de venda'];

        const body = productsCtx.map(product => {
            const { id, name, category, amount, register, saleValue, purchasePrice } = product;
            const { name: nameCategory } = category;
            const dateFormat = formatBr(new Date(register));

            return [id, name, nameCategory, amount, dateFormat, purchasePrice, saleValue];
        });

        generatePdf('Seus produtos', heads, body, 'products');
    }

    return (
        <div className="mt-6">
            <StructureTable 
                title="Produtos 📦"
                handleDeleteItens={handleDeleteProducts}
                lengthRowsSeletec={selectedRows.length}
                handleDelete={handleDeleteProduct}
                handleEdit={handleEditProduct}
                handleView={handleViewProduct}
                handleDownloadPdf={generatePdfProducts}
            >
                <DataTable columns={columns} data={productsCtx} theme='darkCustom' customStyles={customStylesTable} selectableRows onSelectedRowsChange={handleChange} pagination />
            </StructureTable>
        </div>
    )
}

export default TableProducts;