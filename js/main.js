let eventBus = new Vue()
Vue.component('zebra', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
    <div class="product">

        <div class="product-image">
            <img :src="image" :alt="altText" />
        </div>

        <div class="product-info">
            <h1>{{ title }}</h1>
            
            <p>Shipping: {{ shipping }}</p>

            <p>{{ description }}</p>

            <div
                    class="color-box"
                    v-for="(variant, index) in variants"
                    :key="variant.variantId"
                    :style="{ backgroundColor:variant.variantColor }"
                    @mouseover="updateProduct(index)"
            >
            </div>

            <select>
                <option v-for="size in sizes">{{size}}</option>
            </select>

            <a :href="link">More products like this</a>

            <p v-if="inStock">In Stock</p>
            <p v-else-if="inventory <= 10 && inventory > 0">Almost sold out!</p>
            <p
                    v-else
                    :class="{ outOffStock: !inStock }"
            >
                Out of stock
            </p>

            <button
                    v-on:click="addToCart"
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }"
            >
                Add to cart
            </button>
            <button v-on:click="removeFromCart">Remove from cart</button>

        <product-tabs :reviews="reviews"
                      :premium="premium"
        >
        
        </product-tabs>
        
        </div>           
        


    </div>
    `,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            description: "A pair of warm, fuzzy socks",
            selectedVariant: 0,
            altText: "A pair of socks",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            inventory: 100,
            onSale: 'On sale',
            reviews: [],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0
                },
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],

        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
        removeFromCart() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);
        },
        updateCart(id) {
            this.cart.push(id);
        }

    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    },

    computed: {
        title() {
            return this.brand + ' ' + this.product + ' ' + this.onSale;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }

    }

})
Vue.component('product-details', {
    template: `
            <ul>
                <li v-for="detail in details">{{ detail }}</li>
            </ul>
    `,
    data() {
        return {
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
        }
    }
})

Vue.component('product-review', {
    template: `
   <form class="review-form" @submit.prevent="onSubmit">
   
   <p v-if="errors.length">
 <b>Please correct the following error(s):</b>
 <ul>
   <li v-for="error in errors">{{ error }}</li>
 </ul>
</p>

<form>
        <div class="picked">
    
            <p>Would you recommend this product?</p>
             <input type="radio" id="Yes" value="Yes" name="picked"  v-model="picked" />
              <label for="Yes">Yes</label>
              <br />
              <input type="radio" id="No" value="No" name="picked" v-model="picked" />
              <label for="No">No</label>
              <br />

        </div>

</form>

 <p>
   <label for="name">Name:</label>
   <input id="name" v-model="name" placeholder="name">
 </p>

 <p>
   <label for="review">Review:</label>
   <textarea id="review" v-model="review"></textarea>
 </p>

 <p>
   <label for="rating">Rating:</label>
   <select id="rating" v-model.number="rating">
     <option>5</option>
     <option>4</option>
     <option>3</option>
     <option>2</option>
     <option>1</option>
   </select>
 </p>

 <p>
   <input type="submit" value="Submit"> 
 </p>

</form>

 `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: [],
            picked: ''
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating && this.picked) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    picked: this.picked
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.picked = null
            } else {
                if (!this.name) this.errors.push("Name required.")
                if (!this.review) this.errors.push("Review required.")
                if (!this.rating) this.errors.push("Rating required.")
                if (!this.picked) this.errors.push("Question required.")
            }
        }
        ,
        addReview(productReview) {
            this.reviews.push(productReview)
        }

    }

    })

Vue.component('product-tabs', {
    template: `
     <div>   
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
        <div v-show="selectedTab === 'Reviews'">
            <h2>Reviews</h2>
            <p v-if="!reviews.length">There are no reviews yet.</p>
                <ul>
                  <li v-for="review in reviews">
                  <p>Name:{{ review.name }}</p>
                  <p>Rating: {{ review.rating }}</p>
                  <p>Review:{{ review.review }}</p>
                  <span>Questions: {{ review.picked }}</span>
                  </li>
                </ul>
        </div>
        
        <div v-show="selectedTab === 'Make a Review'">
       <product-review></product-review>
        </div>
        
        <div v-show="selectedTab === 'Shipping'">
            <p>Shipping: {{ shipping }}</p>
        </div>

        <div v-show="selectedTab === 'Details'">
            <product-details/>
        </div>
        
        <div v-show="selectedTab === 'New Product'">
           <form>
                   <div>
                          <p>
                            <label for="name">Id:</label>
                            <input id="name" v-model="name" placeholder="Введите id продукта">
                          </p> 
                          
                           <p>
                             <label for="color">Color:</label>
                             <select id="color">
                             <option>red</option>
                             <option>white</option>
                             <option>gray</option>
                             <option>pink</option>
                             <option>black</option>
                               </select>
                           </p> 
                              
                           <p>
                           <label for="picture">Add a picture:</label>
                           <input type="file">
                           </p>  
                             
                           <p>
                            <label for="inStock">В наличии?</label>
                            <input id="inStock" v-model="name" placeholder="Введите 1 если товар в наличии, 0 если нету в наличии">
                          </p> 
                          
                           <p>
                             <input @click="subb" type="submit" value="Submit"> 
                           </p>      
                   </div>         
           </form>
        </div>
        
     </div>
`,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping' , 'Details','New Product'],
            selectedTab: 'Reviews',
            newProduct: []
        }
    },
    methods: {

    },
    props: {

        reviews: {
            type: Array,
            required: false,
        },

        premium: {
            type: Boolean,
            required: true
        }
    },
    computed: {

        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }
    }
})



let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id)
        },
        removeFromCart() {
            this.cart.pop()
        }
    }
})