CREATE PROCEDURE sp_GetAllProducts AS
BEGIN
    SELECT p.ProductID, p.Name, p.ProductNumber, p.Color, p.StandardCost, p.ListPrice, p.ProductSubcategoryID, p.SellStartDate 
    FROM Production.Product p
END
GO

CREATE PROCEDURE sp_GetProductWithCategory AS
BEGIN
    SELECT p.ProductID, p.Name, p.ProductNumber, p.Color, p.StandardCost, p.ListPrice, p.SellStartDate, sc.Name as Subcategory
    FROM Production.Product p
    INNER JOIN Production.ProductSubcategory sc ON p.ProductSubcategoryID = sc.ProductSubcategoryID
END
GO

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
GO

CREATE PROCEDURE sp_UpdateProduct
    @ProductID INT,
    @Name NVARCHAR(50),
    @Color NVARCHAR(15) = NULL,
    @StandardCost MONEY,
    @ListPrice MONEY,
    @ProductSubcategoryID INT = NULL
AS
BEGIN
    UPDATE Production.Product
    SET Name = @Name,
        Color = @Color,
        StandardCost = @StandardCost,
        ListPrice = @ListPrice,
        ProductSubcategoryID = @ProductSubcategoryID,
        ModifiedDate = GETDATE()
    WHERE ProductID = @ProductID
END
GO

CREATE PROCEDURE sp_DeleteProduct
    @ProductID INT
AS
BEGIN
    DELETE FROM Production.Product
    WHERE ProductID = @ProductID
END
GO