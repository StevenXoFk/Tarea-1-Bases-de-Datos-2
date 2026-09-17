CREATE PROCEDURE sp_GetProductWithCategory AS
BEGIN
    SELECT p.ProductID, p.Name, p.ProductNumber, p.Color, p.StandardCost, p.ListPrice, p.SellStartDate, sc.Name as Subcategory
    FROM Production.Product p
    INNER JOIN Production.ProductSubcategory sc ON p.ProductSubcategoryID = sc.ProductSubcategoryID
END