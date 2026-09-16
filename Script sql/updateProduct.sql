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