CREATE PROCEDURE sp_GetAllProducts AS
BEGIN
    SELECT p.ProductID, p.Name, p.ProductNumber, p.Color, p.StandardCost, p.ListPrice, p.ProductSubcategoryID, p.SellStartDate 
    FROM Production.Product p
END