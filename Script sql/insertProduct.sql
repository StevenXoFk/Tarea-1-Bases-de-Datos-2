CREATE PROCEDURE sp_InsertProduct
    @Name NVARCHAR(50),
    @ProductNumber NVARCHAR(25),
    @Color NVARCHAR(15) = NULL,
    @StandardCost MONEY,
    @ListPrice MONEY,
    @ProductSubcategoryID INT = NULL
AS
BEGIN
    INSERT INTO Production.Product (
        Name, ProductNumber, Color, StandardCost, ListPrice, ProductSubcategoryID, MakeFlag,
        FinishedGoodsFlag, SafetyStockLevel, ReorderPoint, DaysToManufacture,
        SellStartDate, rowguid, ModifiedDate
    ) VALUES (
        @Name, @ProductNumber, @Color, @StandardCost, @ListPrice, @ProductSubcategoryID, 1,
        1, 1000, 750, 0,
        GETDATE(), NEWID(), GETDATE()
    )
    SELECT SCOPE_IDENTITY() AS NewProductID
END