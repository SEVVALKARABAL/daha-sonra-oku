import { useState } from "react";
import "./styles.css";
import Header from "./components/Header";
import Article from "./components/Article";
import archivedArticlesApp from "./data/archivedArticles";
import favoritedArticlesApp from "./data/favoritedArticles";
import savedArticles from "./data/savedArticles";
import trashedArticlesApp from "./data/trashedArticles";

export default function App() {
  const [articleQueue, setArticleQueue] = useState(savedArticles);
  const [favoritedArticles, setFavoritedArticles] = useState([
    ...favoritedArticlesApp,
  ]);
  const [archivedArticles, setArchivedArticles] = useState([
    ...archivedArticlesApp,
  ]);
  const [trashedArticles, setTrashedArticles] = useState([
    ...trashedArticlesApp,
  ]);

   // İstatistikleri hesapla ve tut
  const stats = getStats();

  // Makale bileşenlerini oluştur - Her makale için Article componenti render edilir
  const articleComponents = articleQueue.map((articleData) => {
    return <Article articleData={articleData} key={articleData.id} />;
  });

  // Makale yoksa gösterilecek mesaj componenti
  const noArticlesMessage = (
    <p className="no-articles-message">burada gösterilecek makale yok.</p>
  );

  // İstatistikleri hesaplayan yardımcı fonksiyon
  function getStats() {
    return {
      numOfFavorites: favoritedArticles.length,
      numOfArchived: archivedArticles.length,
      numOfTrashed: trashedArticles.length,
    };
  }

  // ID'ye göre makaleyi bulan yardımcı fonksiyon
  function getTargetArticle(id) {
    return savedArticles.find((item) => item.id === id);
  }

  // Kaydedilmiş makalelerden silme işlemi yapan yardımcı fonksiyon
  function removeFromSavedArticles(targetArticle) {
    const targetIndex = savedArticles.indexOf(targetArticle);
    savedArticles.splice(targetIndex, 1);
  }

  /*-----State Ayarlama Fonksiyonları-------------------------------------------*/

    function favorite(id) {
    const targetArticle = getTargetArticle(id);
    /* Eski implementasyon (imperatif yaklaşım):
       - Doğrudan array manipülasyonu yapılıyor
       - Mutable state değişimi var
       - Side effect'ler içeriyor */
    // if (favoritedArticles.includes(targetArticle)) {
    //   const targetIndex = favoritedArticles.indexOf(targetArticle)
    //   favoritedArticles.splice(targetIndex, 1)
    // } else {
    //   favoritedArticles.push(targetArticle)
    // }
    // setArticleQueue([...savedArticles])

    /* Yeni implementasyon (deklaratif yaklaşım):
       - Immutable state güncellemesi
       - Functional update pattern kullanımı
       - Daha öngörülebilir state değişimi */
    setFavoritedArticles((pre) => {
      return pre.includes(targetArticle)
        ? pre.filter((article) => article.id !== targetArticle.id)
        : [...pre, targetArticle];
    });
  }

  function archive(id) {
    const targetArticle = getTargetArticle(id);
    /* Eski implementasyon:
       - Doğrudan array değişimi
       - Multiple state mutations
       - Senkronizasyon sorunlarına açık */
    // removeFromSavedArticles(targetArticle)
    // archivedArticles.push(targetArticle)
    // setArticleQueue([...savedArticles])

    /* Yeni implementasyon:
       - Atomic state updates
       - Immutable state değişimleri
       - Daha güvenilir state yönetimi */
    setArticleQueue((pre) => {
      return pre.filter((archive) => archive.id !== id);
    });
    setArchivedArticles((pre) => [...pre, targetArticle]);
  }

  function trash(id) {
    const targetArticle = getTargetArticle(id);
    /* Eski implementasyon:
       - Kompleks koşullu mantık
       - Birden fazla array manipülasyonu
       - Zor debug edilebilir yapı */
    // removeFromSavedArticles(targetArticle)
    // if (favoritedArticles.includes(targetArticle)) {
    //   const targetIndex = favoritedArticles.indexOf(targetArticle)
    //   favoritedArticles.splice(targetIndex, 1)
    // }
    // trashedArticles.push(targetArticle)
    // setArticleQueue([...savedArticles])

    /* Yeni implementasyon:
       - Basitleştirilmiş mantık
       - Üç state'in atomik güncellenmesi
       - Daha öngörülebilir davranış */
    setArticleQueue((pre) => pre.filter((article) => article.id !== id));
    setFavoritedArticles((pre) => pre.filter((article) => article.id !== id));
    setTrashedArticles((pre) => [...pre, targetArticle]);
  }

  // Makale genişletme/daraltma toggle fonksiyonu
  function toggleExpand(id) {
    setArticleQueue((pre) =>
      pre.map((article) =>
        article.id === id
          ? { ...article, expanded: !article.expanded }
          : article
      )
    );
  }

  // Tüm buton tıklama olaylarını yöneten merkezi event handler
  const handleClick = (e) => {
    const button = e.target.closest("button"); // Event delegation pattern
    if (!button) return;

    // Data attributes'dan buton tipi ve makale ID'sini al
    const buttonType = button.dataset.buttonType;
    const articleId = button.dataset.articleId;

    // Switch statement ile ilgili işlevi çağır
    switch (buttonType) {
      case "favorite":
        favorite(articleId);
        break;
      case "archive":
        archive(articleId);
        break;
      case "trash":
        trash(articleId);
        break;
      case "toggleExpand":
        toggleExpand(articleId);
        break;
    }
  };

  /*-------------------------------------------------------------------------*/

  /* Challenge

    Her makale için bulunan dört buton da çalışmıyor. Göreviniz bunları aşağıdaki gibi ayarlamaktır: 
    
        1. "articles-container" div'ine tek bir onClick olay işleyicisi eklemelisiniz. Projeye başka hiçbir olay işleyici eklenmemelidir. Olay işleyici, aşağıdakileri yapmak için butonların "button-type" ve "article-id" data niteliklerini kullanmalıdır: 
          
         eğer butonun             O zaman butonun 
			   "button-type"          "article-id" veri değerini
			   data değeri:            aşağıdakileri yapmak için:      				   
		 	╷---------------------╷-----------------------------╷					
	    |      "favorite"     |	      favorite(idValue)     |
			|---------------------|-----------------------------|
			|      "archive"      |	    archive(idValue)        |
			|---------------------|-----------------------------|
			|       "trash"       |	      trash(idValue)        |
      |---------------------|-----------------------------|
			|    "toggleExpand"   |	  toggleExpand(idValue)     |	
			¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯	
			                      idValue = "article-id" data niteliğinin değeri. 
								            	 Bu sadece açıklama amaçlıdır - bu şekilde adlandırmak zorunda değilsiniz
			        
    2. Yukarıda listelenen ilk üç fonksiyon zaten çalışmaktadır ve değiştirilmemelidir. Ancak, toggleExpand fonksiyonu (satır 71) şu anda bozuk ve düzeltilmesi gerekiyor. Bunu düzeltmek için *sadece* çok küçük (ama önemli) bir değişiklik yapmanız gerekiyor. Sorunun tam olarak ne olduğunu ve çözümünüzün bunu neden düzelttiğini tanımlamaya ve ifade etmeye çalışın.  
		   
		3. Olay işleyicisi için kodunuz, okunabilirliği korurken mümkün olduğunca kısa ve DRY (Kendinizi Tekrar Etmeden) olmalıdır. 
		
		4. Doğru çalıştığından emin olmak için uygulamayı test etmelisiniz. Yukarıdaki görevleri tamamladıktan sonra, daha fazla butonuna tıkladığınızda bir makale genişlemeli, kalp şeklindeki favori butonuna tıkladığınızda açılıp kapanmalı ve arşiv veya çöp kutusu butonuna tıkladığınızda makale kaybolmalıdır. Uygulamanın üst kısmındaki sayılar da favorilere eklediğiniz, arşivlediğiniz veya çöpe attığınız makale sayısını yansıtmalıdır. 
		   
		Bonus Görev: Yukarıda listelenen dört fonksiyon kuruldukları şekilde çalışacak olsalar da (dördüncüyü düzelttikten sonra), alışılmışın dışında ve tartışmalı bir şekilde "yanlış" giden bir şey var - React Dokümantasyonunun karşı uyardığı bir şey. Bakalım ne olduğunu bulabilecek misiniz.  

	
 */

  return (
    <div className="wrapper">
      <Header stats={stats} setArticleQueue={setArticleQueue} />
      <div className="articles-container" onClick={handleClick}>
        {articleQueue.length > 0 ? articleComponents : noArticlesMessage}
      </div>
    </div>
  );
}