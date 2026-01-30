# v0.1.0
# { "Depends": "py-genlayer:latest" }

from genlayer import *
import json


class WildGuess(gl.Contract):
    """
    Wild Guess - Can you stump the AI?
    
    A fun game where players upload animal images and challenge
    AI to identify them correctly. Win if AI guesses wrong!
    """
    
    # Game state
    next_challenge_id: u256
    
    # Challenge data (indexed by challenge_id)
    challenge_player: TreeMap[u256, str]
    challenge_image_url: TreeMap[u256, str]
    challenge_correct_animal: TreeMap[u256, str]
    challenge_ai_guess: TreeMap[u256, str]
    challenge_result: TreeMap[u256, str]  # "win" or "lose"
    challenge_timestamp: TreeMap[u256, str]
    
    # Player stats
    player_total_challenges: TreeMap[str, u256]
    player_wins: TreeMap[str, u256]
    player_losses: TreeMap[str, u256]
    player_win_streak: TreeMap[str, u256]
    player_best_streak: TreeMap[str, u256]
    
    # Weekly leaderboard
    current_week: u256
    week_start_time: str
    weekly_player_wins: TreeMap[str, u256]  # "week:player" -> wins
    
    # All challenges list
    all_challenges: TreeMap[u256, u256]
    
    def __init__(self):
        self.next_challenge_id = 0
        self.current_week = 0
        self.week_start_time = ""
    
    @gl.public.write
    def submit_challenge(self, player: str, image_url: str, correct_animal: str) -> dict:
        """
        Submit an animal image for AI to identify
        
        Args:
            player: Player's address
            image_url: URL or base64 of the animal image
            correct_animal: What the animal actually is (for verification)
        """
        if not image_url or len(image_url) < 10:
            return {"success": False, "message": "Invalid image URL"}
        
        if not correct_animal or len(correct_animal) < 2:
            return {"success": False, "message": "Please specify the correct animal name"}
        
        challenge_id = self.next_challenge_id
        self.next_challenge_id += 1
        
        timestamp = gl.message_raw.get("datetime", "unknown")
        
        # Ask AI to identify the animal
        ai_guess = self._identify_animal(image_url)
        
        # Check if AI was correct (case-insensitive comparison)
        correct_lower = correct_animal.lower().strip()
        guess_lower = ai_guess.lower().strip()
        
        # Player wins if AI is wrong!
        player_won = correct_lower not in guess_lower and guess_lower not in correct_lower
        result = "win" if player_won else "lose"
        
        # Save challenge
        self.challenge_player[challenge_id] = player
        self.challenge_image_url[challenge_id] = image_url
        self.challenge_correct_animal[challenge_id] = correct_animal
        self.challenge_ai_guess[challenge_id] = ai_guess
        self.challenge_result[challenge_id] = result
        self.challenge_timestamp[challenge_id] = timestamp
        
        # Add to all challenges
        self.all_challenges[challenge_id] = challenge_id
        
        # Update player stats
        self._update_player_stats(player, player_won)
        
        # Update weekly stats
        self._update_weekly_stats(player, player_won, timestamp)
        
        return {
            "success": True,
            "challenge_id": challenge_id,
            "ai_guess": ai_guess,
            "correct_animal": correct_animal,
            "result": result,
            "message": f"🎉 You won! AI guessed '{ai_guess}' but it was '{correct_animal}'!" if player_won 
                      else f"😔 AI got it! Correctly identified as '{ai_guess}'",
            "player_won": player_won
        }
    
    @gl.public.view
    def get_challenge(self, challenge_id: u256) -> dict:
        """Get details of a specific challenge"""
        if challenge_id not in self.challenge_player:
            return {"error": "Challenge not found"}
        
        return {
            "challenge_id": challenge_id,
            "player": self.challenge_player[challenge_id],
            "image_url": self.challenge_image_url[challenge_id],
            "correct_animal": self.challenge_correct_animal[challenge_id],
            "ai_guess": self.challenge_ai_guess[challenge_id],
            "result": self.challenge_result[challenge_id],
            "timestamp": self.challenge_timestamp[challenge_id]
        }
    
    @gl.public.view
    def get_player_stats(self, player: str) -> dict:
        """Get player's statistics"""
        total = self.player_total_challenges.get(player, 0)
        wins = self.player_wins.get(player, 0)
        losses = self.player_losses.get(player, 0)
        
        win_rate = "0%"
        if total > 0:
            rate = (wins * 100) // total
            win_rate = f"{rate}%"
        
        return {
            "player": player,
            "total_challenges": total,
            "wins": wins,
            "losses": losses,
            "win_rate": win_rate,
            "current_streak": self.player_win_streak.get(player, 0),
            "best_streak": self.player_best_streak.get(player, 0)
        }
    
    @gl.public.view
    def get_recent_challenges(self, limit: u256) -> list:
        """Get recent challenges"""
        if limit == 0 or limit > 50:
            limit = 50
        
        challenges = []
        start = 0 if self.next_challenge_id < limit else self.next_challenge_id - limit
        
        for i in range(start, self.next_challenge_id):
            if i in self.all_challenges:
                challenge_id = self.all_challenges[i]
                challenges.append({
                    "challenge_id": challenge_id,
                    "player": self.challenge_player[challenge_id],
                    "correct_animal": self.challenge_correct_animal[challenge_id],
                    "ai_guess": self.challenge_ai_guess[challenge_id],
                    "result": self.challenge_result[challenge_id],
                    "timestamp": self.challenge_timestamp[challenge_id],
                    "image_url": self.challenge_image_url[challenge_id],
                    "you_won": self.challenge_result[challenge_id] == "win"
                })
        
        # Reverse to show newest first
        challenges.reverse()
        return challenges
    
    @gl.public.view
    def get_player_challenges(self, player: str, limit: u256) -> list:
        """Get challenges for a specific player"""
        if limit == 0 or limit > 50:
            limit = 50
        
        challenges = []
        count = 0
        
        # Iterate backwards through challenges to get most recent first
        for i in range(self.next_challenge_id - 1, -1, -1):
            if count >= limit:
                break
                
            if i in self.challenge_player and self.challenge_player[i] == player:
                challenges.append({
                    "challenge_id": i,
                    "player": self.challenge_player[i],
                    "correct_animal": self.challenge_correct_animal[i],
                    "ai_guess": self.challenge_ai_guess[i],
                    "result": self.challenge_result[i],
                    "timestamp": self.challenge_timestamp[i],
                    "image_url": self.challenge_image_url[i],
                    "you_won": self.challenge_result[i] == "win",
                    "confidence": 0  # Placeholder for UI compatibility
                })
                count += 1
        
        return challenges
    
    @gl.public.view
    def get_leaderboard(self, limit: u256) -> list:
        """Get top players by wins"""
        if limit == 0 or limit > 100:
            limit = 100
        
        # Collect all players with their stats
        players = []
        seen_players = set()
        
        # Iterate through all challenges to find unique players
        for i in range(self.next_challenge_id):
            if i in self.challenge_player:
                player_addr = self.challenge_player[i]
                if player_addr not in seen_players:
                    seen_players.add(player_addr)
                    
                    total = self.player_total_challenges.get(player_addr, 0)
                    wins = self.player_wins.get(player_addr, 0)
                    losses = self.player_losses.get(player_addr, 0)
                    best_streak = self.player_best_streak.get(player_addr, 0)
                    
                    win_rate = "0%"
                    if total > 0:
                        rate = (wins * 100) // total
                        win_rate = f"{rate}%"
                    
                    players.append({
                        "player": player_addr,
                        "wins": wins,
                        "losses": losses,
                        "total_challenges": total,
                        "win_rate": win_rate,
                        "best_streak": best_streak
                    })
        
        # Sort by wins (descending), then by best_streak (descending)
        # Note: Python's sort is stable, so we sort by secondary key first
        sorted_players = sorted(players, key=lambda x: (x["wins"], x["best_streak"]), reverse=True)
        
        # Add rank and limit results
        result = []
        for i, player in enumerate(sorted_players[:limit]):
            player["rank"] = i + 1
            result.append(player)
        
        return result
    
    def _identify_animal(self, image_url: str) -> str:
        """Use AI to identify the animal in the image"""
        
        prompt = """Analyze the following image and identify what animal is in it.
Return ONLY the animal name in English, nothing else.

Examples of good responses:
- "cat"
- "dog"
- "elephant"
- "tiger"
- "eagle"
- "penguin"

If you cannot identify the animal or the image is unclear, respond with "unknown animal".

Return a JSON with the animal name as follows:
{
    "animal": str  // the name of the animal in the image
}

It is mandatory that you respond only using the JSON format above,
nothing else. Don't include any other words or characters,
your output must be only JSON without any formatting prefix or suffix.
This result should be perfectly parsable by a JSON parser without errors.
"""
        
        def non_det():
            try:
                # Use web.render for URL images (GenLayer only supports URLs, not data URIs)
                web_data = gl.nondet.web.render(image_url, mode="screenshot")
                result = gl.nondet.exec_prompt(prompt, images=[web_data])
                
                # Extract JSON from response
                json_str = self._extract_json(result)
                parsed = json.loads(json_str)
                return parsed
                
            except Exception as e:
                return {"animal": f"error: {str(e)}"}
        
        try:
            # Use Optimistic Democracy for AI consensus
            result_json = gl.eq_principle.strict_eq(non_det)
            
            # Get animal name from JSON
            animal_name = result_json.get("animal", "unknown animal").strip().lower()
            
            # Clean up response
            animal_name = animal_name.replace("the ", "")
            animal_name = animal_name.replace("a ", "")
            animal_name = animal_name.replace("an ", "")
            
            return animal_name
            
        except Exception as e:
            return "unknown animal"
    
    def _extract_json(self, s: str) -> str:
        """Extract JSON object from a string"""
        start_index = s.find("{")
        end_index = s.rfind("}")
        if start_index != -1 and end_index != -1 and start_index < end_index:
            return s[start_index : end_index + 1]
        else:
            return "{}"
    
    def _update_player_stats(self, player: str, won: bool):
        """Update player's statistics"""
        # Update totals
        self.player_total_challenges[player] = self.player_total_challenges.get(player, 0) + 1
        
        if won:
            self.player_wins[player] = self.player_wins.get(player, 0) + 1
            
            # Update win streak
            current_streak = self.player_win_streak.get(player, 0) + 1
            self.player_win_streak[player] = current_streak
            
            # Update best streak
            best_streak = self.player_best_streak.get(player, 0)
            if current_streak > best_streak:
                self.player_best_streak[player] = current_streak
        else:
            self.player_losses[player] = self.player_losses.get(player, 0) + 1
            # Reset win streak
            self.player_win_streak[player] = 0
    
    def _update_weekly_stats(self, player: str, won: bool, timestamp: str):
        """Update weekly statistics"""
        # Update week if needed
        if self.week_start_time == "":
            self.week_start_time = timestamp
            self.current_week = 0
        
        # Simple week tracking (in production, calculate actual week difference)
        week_key = f"{self.current_week}:{player}"
        
        if won:
            self.weekly_player_wins[week_key] = self.weekly_player_wins.get(week_key, 0) + 1
