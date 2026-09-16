CREATE PROCEDURE sp_DeleteProduct
    @ProductID INT
AS
BEGIN
    DELETE FROM Production.Product
    WHERE ProductID = @ProductID
END