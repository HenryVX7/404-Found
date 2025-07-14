# Interactive Brainrot Pipeline - ai_pipeline.py
import openai
import requests
import json
import base64
import io
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os
import time
import torch
import imageio
import numpy as np
import random
import math
import glob
from pathlib import Path

# Hardcoded API keys
OPENAI_API_KEY = "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"
STABILITY_API_KEY = "sk-1r0z0DYh1P4fNisVyH54sV7guWeiyHVybqxbEk8vEqNV9iOu"

class InteractiveBrainrotPipeline:
    """Interactive Brainrot Pipeline with 3 generation modes"""
    
    def __init__(self):
        # Initialize APIs
        self.openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)
        self.stability_api_key = STABILITY_API_KEY
        
        # Initialize models
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.svd_pipe = None
        
        # Create directories
        os.makedirs("outputs", exist_ok=True)
        os.makedirs("gameplay_videos", exist_ok=True)
        os.makedirs("celebrity_faces", exist_ok=True)
        
        print(f"🔧 Interactive Brainrot Pipeline using: {self.device}")
        if torch.cuda.is_available():
            print(f"   GPU: {torch.cuda.get_device_name(0)}")

    def show_menu(self):
        """Display the interactive menu"""
        print("\n" + "="*60)
        print("🧠 ULTIMATE BRAINROT GENERATOR 🧠")
        print("="*60)
        print()
        print("Choose your brainrot mode:")
        print()
        print("1️⃣  RANDOM BRAINROT")
        print("    💀 Classic chaotic TikTok style")
        print("    🎬 AI-generated images + viral effects")
        print("    ⏱️  15 seconds of pure chaos")
        print()
        print("2️⃣  REDDIT TTS BRAINROT")
        print("    🎮 Gameplay background video")
        print("    🗣️  AI-generated Reddit story with TTS")
        print("    📱 Ends with company advertisement")
        print("    📁 Put gameplay videos in: ./gameplay_videos/")
        print()
        print("3️⃣  CELEBRITY BRAINROT")
        print("    🎭 Deepfake celebrity face")
        print("    💬 Celebrity endorsing your business")
        print("    🌟 Professional but cursed")
        print("    📁 Put celebrity images in: ./celebrity_faces/")
        print()
        print("="*60)
        
        while True:
            try:
                choice = input("Enter your choice (1, 2, or 3): ").strip()
                if choice in ['1', '2', '3']:
                    return int(choice)
                else:
                    print("❌ Please enter 1, 2, or 3")
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                exit()

    def get_business_info(self):
        """Get business information from user"""
        print("\n📝 Enter your business information:")
        
        business_info = {}
        business_info['businessName'] = input("Business Name: ").strip()
        business_info['businessType'] = input("Business Type: ").strip()
        business_info['uniqueSellingPoint'] = input("What makes you special?: ").strip()
        business_info['websiteUrl'] = input("Website URL: ").strip()
        
        print("\nChoose your vibe:")
        print("1. chaotic-good (unhinged but helpful)")
        print("2. cursed-energy (deeply unsettling)")
        print("3. gen-z-humor (brainrot supreme)")
        
        vibe_choice = input("Vibe (1-3): ").strip()
        vibes = {'1': 'chaotic-good', '2': 'cursed-energy', '3': 'gen-z-humor'}
        business_info['vibe'] = vibes.get(vibe_choice, 'chaotic-good')
        
        return business_info

    def mode_1_random_brainrot(self, business_info):
        """Mode 1: Random Brainrot (existing pipeline)"""
        print("\n🌪️ GENERATING RANDOM BRAINROT...")
        
        # Use existing pipeline
        optimized = self.optimize_user_prompt(business_info)
        image_path = self.generate_image(optimized)
        video_path = self._create_ultimate_brainrot_video(image_path, optimized)
        
        return {
            'mode': 'Random Brainrot',
            'optimized_concept': optimized,
            'image_path': image_path,
            'video_path': video_path,
            'success': video_path is not None
        }

    def mode_2_reddit_tts_brainrot(self, business_info):
        """Mode 2: Reddit TTS Brainrot with gameplay background"""
        print("\n🎮 GENERATING REDDIT TTS BRAINROT...")
        
        # Check for gameplay videos
        gameplay_files = glob.glob("gameplay_videos/*.mp4") + glob.glob("gameplay_videos/*.avi") + glob.glob("gameplay_videos/*.mov")
        
        if not gameplay_files:
            print("❌ No gameplay videos found in ./gameplay_videos/")
            print("💡 Creating placeholder gameplay video...")
            
            # Create a placeholder "gameplay" video
            gameplay_video = self._create_placeholder_gameplay()
            
            if not gameplay_video:
                return {
                    'mode': 'Reddit TTS Brainrot',
                    'success': False, 
                    'error': 'No gameplay videos and fallback failed'
                }
        else:
            # Select random gameplay video
            gameplay_video = random.choice(gameplay_files)
            print(f"🎮 Using gameplay: {os.path.basename(gameplay_video)}")
        
        # Generate Reddit story
        reddit_story = self._generate_reddit_story(business_info)
        
        # Generate TTS audio
        audio_path = self._generate_tts_audio(reddit_story)
        
        # Combine gameplay + TTS
        video_path = self._create_reddit_tts_video(gameplay_video, audio_path, reddit_story, business_info)
        
        return {
            'mode': 'Reddit TTS Brainrot',
            'reddit_story': reddit_story,
            'gameplay_video': gameplay_video,
            'audio_path': audio_path,
            'video_path': video_path,
            'success': video_path is not None
        }

    def mode_3_celebrity_brainrot(self, business_info):
        """Mode 3: Celebrity Brainrot with deepfake"""
        print("\n🌟 GENERATING CELEBRITY BRAINROT...")
        
        # Check for celebrity images
        celebrity_files = glob.glob("celebrity_faces/*.jpg") + glob.glob("celebrity_faces/*.png") + glob.glob("celebrity_faces/*.jpeg")
        
        if not celebrity_files:
            print("❌ No celebrity images found in ./celebrity_faces/")
            print("💡 Creating placeholder celebrity...")
            
            # Create a placeholder celebrity
            celebrity_image = self._create_placeholder_celebrity()
            celebrity_name = "AI Celebrity"
            
            if not celebrity_image:
                return {
                    'mode': 'Celebrity Brainrot',
                    'success': False, 
                    'error': 'No celebrity images and fallback failed'
                }
        else:
            # Select random celebrity
            celebrity_image = random.choice(celebrity_files)
            celebrity_name = os.path.splitext(os.path.basename(celebrity_image))[0].replace('_', ' ').title()
            print(f"🌟 Using celebrity: {celebrity_name}")
        
        # Generate celebrity script
        celebrity_script = self._generate_celebrity_script(business_info, celebrity_name)
        
        # Create deepfake video
        video_path = self._create_celebrity_video(celebrity_image, celebrity_script, business_info)
        
        return {
            'mode': 'Celebrity Brainrot',
            'celebrity_name': celebrity_name,
            'celebrity_image': celebrity_image,
            'celebrity_script': celebrity_script,
            'video_path': video_path,
            'success': video_path is not None
        }

    def _generate_reddit_story(self, business_info):
        """Generate a Reddit-style story that ties to the business"""
        
        business_name = business_info.get('businessName', 'this business')
        business_type = business_info.get('businessType', 'service')
        website = business_info.get('websiteUrl', 'their website')
        
        reddit_prompt = f"""
        Write a Reddit-style story that sounds completely real but gets increasingly absurd. 
        The story should:
        - Start normal and relatable
        - Gradually become more ridiculous
        - Have a plot twist near the end
        - End with the narrator discovering {business_name} ({business_type}) and how it saved their life
        - Mention visiting {website}
        - Be 2-3 minutes when read aloud
        - Include typical Reddit phrases like "So this happened", "UPDATE:", "EDIT:", etc.
        - Sound like it could be from r/tifu, r/relationships, or r/antiwork
        
        Make it genuinely engaging but completely unhinged by the end.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a Reddit user who writes incredibly engaging but increasingly absurd stories. Your stories always go viral because they're so wild yet believable at first."},
                    {"role": "user", "content": reddit_prompt}
                ],
                temperature=0.9,
                max_tokens=1500
            )
            
            story = response.choices[0].message.content.strip()
            print("✅ Reddit story generated")
            return story
            
        except Exception as e:
            print(f"❌ Reddit story generation failed: {e}")
            return f"So this happened to me yesterday. I was just living my normal life when I discovered {business_name}. Honestly, it completely changed everything. You should check out {website} because it's incredible. Like seriously, this {business_type} business is amazing."

    def _generate_tts_audio(self, text):
        """Generate TTS audio from text"""
        try:
            print("🗣️ Generating TTS audio...")
            
            # Try to use real TTS if available
            try:
                # Option 1: Try OpenAI TTS API
                response = self.openai_client.audio.speech.create(
                    model="tts-1",
                    voice="alloy",  # Natural sounding voice
                    input=text[:4000]  # Limit text length
                )
                
                audio_filename = f"tts_audio_{int(time.time())}.mp3"
                audio_path = os.path.join("outputs", audio_filename)
                
                # Save audio
                with open(audio_path, 'wb') as f:
                    f.write(response.content)
                
                print("✅ Real TTS audio generated with OpenAI")
                return audio_path
                
            except Exception as e:
                print(f"OpenAI TTS failed: {e}")
                
                # Option 2: Try system TTS (Windows)
                try:
                    import pyttsx3
                    
                    engine = pyttsx3.init()
                    engine.setProperty('rate', 200)  # Speaking rate
                    
                    audio_filename = f"tts_audio_{int(time.time())}.wav"
                    audio_path = os.path.join("outputs", audio_filename)
                    
                    engine.save_to_file(text, audio_path)
                    engine.runAndWait()
                    
                    print("✅ System TTS audio generated")
                    return audio_path
                    
                except ImportError:
                    print("pyttsx3 not installed. Install with: pip install pyttsx3")
                except Exception as e2:
                    print(f"System TTS failed: {e2}")
            
            # Fallback: Create silent audio placeholder
            print("⚠️ Creating silent audio placeholder")
            audio_filename = f"silent_audio_{int(time.time())}.txt"
            audio_path = os.path.join("outputs", audio_filename)
            
            with open(audio_path, 'w', encoding='utf-8') as f:
                f.write(text)
            
            return audio_path
            
        except Exception as e:
            print(f"❌ All TTS methods failed: {e}")
            return None

    def _create_reddit_tts_video(self, gameplay_video, audio_path, story, business_info):
        """Create Reddit TTS video with gameplay background and text overlay"""
        try:
            print("🎬 Creating Reddit TTS video with gameplay background...")
            
            # Try using moviepy for proper video editing
            try:
                from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip, AudioFileClip
                
                # Load gameplay video
                gameplay_clip = VideoFileClip(gameplay_video)
                
                # Resize gameplay to fit screen
                gameplay_clip = gameplay_clip.resize((576, 1024))
                
                # Prepare story text
                story_sentences = story.split('. ')
                
                # Calculate timing - show each sentence for a few seconds
                sentence_duration = min(3.0, max(1.5, len(story) / len(story_sentences) / 10))
                total_duration = len(story_sentences) * sentence_duration
                
                # Limit gameplay duration
                if gameplay_clip.duration < total_duration:
                    gameplay_clip = gameplay_clip.loop(duration=total_duration)
                else:
                    gameplay_clip = gameplay_clip.subclip(0, total_duration)
                
                # Create text clips
                text_clips = []
                
                try:
                    # Try to find a good font
                    font_path = "C:/Windows/Fonts/arial.ttf"
                    if not os.path.exists(font_path):
                        font_path = "Arial"  # Fallback to system font
                except:
                    font_path = "Arial"
                
                for i, sentence in enumerate(story_sentences):
                    if sentence.strip():
                        start_time = i * sentence_duration
                        
                        # Create text clip
                        txt_clip = TextClip(
                            sentence.strip(),
                            fontsize=40,
                            color='white',
                            font=font_path,
                            stroke_color='black',
                            stroke_width=2,
                            method='caption',
                            size=(520, None),  # Width constraint for wrapping
                            align='center'
                        ).set_position(('center', 'center')).set_start(start_time).set_duration(sentence_duration)
                        
                        text_clips.append(txt_clip)
                
                # Add audio if available
                final_clips = [gameplay_clip] + text_clips
                
                if audio_path and audio_path.endswith(('.mp3', '.wav', '.m4a')):
                    try:
                        audio_clip = AudioFileClip(audio_path)
                        if audio_clip.duration > total_duration:
                            audio_clip = audio_clip.subclip(0, total_duration)
                        elif audio_clip.duration < total_duration:
                            # Loop audio if too short
                            audio_clip = audio_clip.loop(duration=total_duration)
                        
                        gameplay_clip = gameplay_clip.set_audio(audio_clip)
                        final_clips[0] = gameplay_clip
                    except Exception as e:
                        print(f"⚠️ Audio attachment failed: {e}")
                
                # Composite video
                final_video = CompositeVideoClip(final_clips)
                
                # Save video
                video_filename = f"reddit_tts_{business_info.get('businessName', 'business').replace(' ', '_')}_{int(time.time())}.mp4"
                video_path = os.path.join("outputs", video_filename)
                
                final_video.write_videofile(
                    video_path,
                    fps=24,
                    codec='libx264',
                    audio_codec='aac',
                    verbose=False,
                    logger=None
                )
                
                # Clean up
                gameplay_clip.close()
                final_video.close()
                if 'audio_clip' in locals():
                    audio_clip.close()
                
                print(f"✅ Professional Reddit TTS video created: {video_filename}")
                return video_path
                
            except ImportError:
                print("❌ MoviePy not installed. Install with: pip install moviepy")
                print("🔄 Falling back to basic implementation...")
                
            except Exception as e:
                print(f"❌ MoviePy failed: {e}")
                print("🔄 Falling back to basic implementation...")
            
            # Fallback: Basic implementation without moviepy
            return self._create_basic_reddit_video(gameplay_video, story, business_info)
            
        except Exception as e:
            print(f"❌ Reddit TTS video creation failed: {e}")
            return None

    def _create_basic_reddit_video(self, gameplay_video, story, business_info):
        """Basic Reddit video without moviepy"""
        try:
            print("🎬 Creating basic Reddit-style video...")
            
            # Read gameplay video frames
            try:
                import cv2
                
                cap = cv2.VideoCapture(gameplay_video)
                gameplay_frames = []
                
                # Read first 180 frames (30 seconds at 6fps)
                for i in range(180):
                    ret, frame = cap.read()
                    if not ret:
                        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  # Loop back to start
                        ret, frame = cap.read()
                    
                    if ret:
                        # Convert BGR to RGB and resize
                        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        frame_pil = Image.fromarray(frame_rgb).resize((576, 1024), Image.Resampling.LANCZOS)
                        gameplay_frames.append(frame_pil)
                
                cap.release()
                
            except Exception as e:
                print(f"Could not read gameplay video: {e}")
                # Create simple animated background
                gameplay_frames = []
                for i in range(180):
                    frame = Image.new('RGB', (576, 1024), color=(20, 30, 60))
                    draw = ImageDraw.Draw(frame)
                    
                    # Simple animation
                    for j in range(3):
                        x = (i * 2 + j * 200) % 600
                        y = 300 + j * 200
                        draw.rectangle([x, y, x+80, y+120], fill=(100, 150, 255))
                    
                    draw.text((200, 950), "GAMEPLAY", fill='white')
                    gameplay_frames.append(frame)
            
            # Prepare story text
            story_sentences = story.split('. ')
            
            # Create final frames with text overlay
            final_frames = []
            
            try:
                font_large = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 36)
            except:
                font_large = ImageFont.load_default()
            
            frames_per_sentence = max(15, 180 // len(story_sentences))  # At least 2.5 seconds per sentence
            
            for i in range(180):
                # Get gameplay frame
                gameplay_frame = gameplay_frames[i % len(gameplay_frames)].copy()
                
                # Add semi-transparent overlay for text readability
                overlay = Image.new('RGBA', gameplay_frame.size, (0, 0, 0, 100))
                overlay_area = Image.new('RGBA', (540, 200), (0, 0, 0, 150))
                overlay.paste(overlay_area, (18, 400))
                
                gameplay_frame = Image.alpha_composite(gameplay_frame.convert('RGBA'), overlay).convert('RGB')
                
                # Add text
                draw = ImageDraw.Draw(gameplay_frame)
                
                # Current sentence
                sentence_index = min(i // frames_per_sentence, len(story_sentences) - 1)
                current_sentence = story_sentences[sentence_index].strip()
                
                if current_sentence:
                    # Wrap text
                    words = current_sentence.split()
                    lines = []
                    current_line = ""
                    
                    for word in words:
                        test_line = current_line + " " + word if current_line else word
                        if len(test_line) > 25:  # Characters per line
                            if current_line:
                                lines.append(current_line)
                                current_line = word
                            else:
                                lines.append(test_line)
                                current_line = ""
                        else:
                            current_line = test_line
                    
                    if current_line:
                        lines.append(current_line)
                    
                    # Draw text lines centered
                    y_start = 450
                    for line in lines[:4]:  # Max 4 lines
                        try:
                            bbox = draw.textbbox((0, 0), line, font=font_large)
                            text_width = bbox[2] - bbox[0]
                            x_pos = (576 - text_width) // 2
                        except:
                            x_pos = 50
                        
                        # Text with outline
                        for dx in range(-1, 2):
                            for dy in range(-1, 2):
                                if dx != 0 or dy != 0:
                                    draw.text((x_pos + dx, y_start + dy), line, fill='black', font=font_large)
                        
                        draw.text((x_pos, y_start), line, fill='white', font=font_large)
                        y_start += 45
                
                final_frames.append(np.array(gameplay_frame))
            
            # Save video
            video_filename = f"reddit_tts_{business_info.get('businessName', 'business').replace(' ', '_')}_{int(time.time())}.mp4"
            video_path = os.path.join("outputs", video_filename)
            
            imageio.mimsave(
                video_path,
                final_frames,
                fps=6,
                format='mp4',
                codec='libx264'
            )
            
            print(f"✅ Basic Reddit TTS video created: {video_filename}")
            return video_path
            
        except Exception as e:
            print(f"❌ Basic Reddit video creation failed: {e}")
            return None

    def _generate_celebrity_script(self, business_info, celebrity_name):
        """Generate celebrity endorsement script"""
        
        business_name = business_info.get('businessName', 'this business')
        business_type = business_info.get('businessType', 'service')
        website = business_info.get('websiteUrl', 'their website')
        
        celebrity_prompt = f"""
        Write a short, enthusiastic endorsement script as if {celebrity_name} is genuinely excited about {business_name}.
        
        The script should:
        - Sound like {celebrity_name}'s speaking style
        - Be 30-45 seconds when spoken
        - Mention {business_name} and {business_type}
        - Include {website}
        - Sound authentic but slightly over-the-top
        - Have the energy of a genuine celebrity endorsement
        
        Make it sound like {celebrity_name} actually discovered and loves this business.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": f"You are a script writer who captures {celebrity_name}'s speaking style perfectly. You write authentic-sounding celebrity endorsements."},
                    {"role": "user", "content": celebrity_prompt}
                ],
                temperature=0.8,
                max_tokens=500
            )
            
            script = response.choices[0].message.content.strip()
            print(f"✅ {celebrity_name} script generated")
            return script
            
        except Exception as e:
            print(f"❌ Celebrity script generation failed: {e}")
            return f"Hey everyone! I just discovered {business_name} and I'm absolutely obsessed. This {business_type} has completely changed my life. You need to check out {website} right now. Trust me on this one!"

    def _create_celebrity_video(self, celebrity_image, script, business_info):
        """Create celebrity deepfake video (mock implementation)"""
        try:
            print("🎭 Creating celebrity video...")
            
            # For demo: Create video with celebrity image + text
            # In production, you'd use:
            # - First Order Motion Model
            # - Real-ESRGAN for upscaling
            # - Wav2Lip for lip sync
            # - Face restoration
            
            # Load celebrity image
            celebrity_img = Image.open(celebrity_image).convert('RGB')
            celebrity_img = celebrity_img.resize((576, 1024), Image.Resampling.LANCZOS)
            
            # Create frames
            frames = []
            script_words = script.split()
            
            try:
                font_subtitle = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 35)
            except:
                font_subtitle = ImageFont.load_default()
            
            for i in range(90):  # 15 seconds
                frame = celebrity_img.copy()
                
                # Add subtle animation (slight zoom/movement)
                zoom = 1.0 + 0.02 * np.sin(i * 0.1)
                new_size = (int(576 * zoom), int(1024 * zoom))
                frame = frame.resize(new_size, Image.Resampling.LANCZOS)
                
                if zoom > 1.0:
                    left = (new_size[0] - 576) // 2
                    top = (new_size[1] - 1024) // 2
                    frame = frame.crop((left, top, left + 576, top + 1024))
                
                # Add subtitle overlay
                draw = ImageDraw.Draw(frame)
                
                # Show script words progressively
                words_to_show = min(len(script_words), (i // 3) + 1)
                current_text = ' '.join(script_words[:words_to_show])
                
                # Wrap text for subtitles
                words = current_text.split()
                subtitle_lines = []
                current_line = ""
                
                for word in words[-15:]:  # Show last 15 words
                    test_line = current_line + " " + word if current_line else word
                    if len(test_line) > 25:
                        subtitle_lines.append(current_line)
                        current_line = word
                    else:
                        current_line = test_line
                subtitle_lines.append(current_line)
                
                # Draw subtitle background
                if subtitle_lines:
                    subtitle_height = len(subtitle_lines) * 40 + 20
                    draw.rectangle([0, 1024 - subtitle_height - 50, 576, 1024 - 50], 
                                 fill=(0, 0, 0, 180))
                    
                    # Draw subtitle text
                    y_pos = 1024 - subtitle_height - 30
                    for line in subtitle_lines:
                        if line.strip():
                            # Center text
                            try:
                                bbox = draw.textbbox((0, 0), line, font=font_subtitle)
                                text_width = bbox[2] - bbox[0]
                                x_pos = (576 - text_width) // 2
                            except:
                                x_pos = 50
                            
                            draw.text((x_pos, y_pos), line, fill='white', font=font_subtitle)
                            y_pos += 40
                
                frames.append(np.array(frame))
            
            # Save video
            celebrity_name = os.path.splitext(os.path.basename(celebrity_image))[0]
            video_filename = f"celebrity_{celebrity_name}_{business_info.get('businessName', 'business')}_{int(time.time())}.mp4"
            video_path = os.path.join("outputs", video_filename)
            
            imageio.mimsave(video_path, frames, fps=6, format='mp4')
            
            print(f"✅ Celebrity video created: {video_filename}")
            return video_path
            
        except Exception as e:
            print(f"❌ Celebrity video creation failed: {e}")
            return None

    # Include existing methods (optimize_user_prompt, generate_image, etc.)
    def optimize_user_prompt(self, user_input: dict) -> dict:
        """Step 1: LLM optimizes user's business info into viral content"""
        
        business_name = user_input.get('businessName', '')
        business_type = user_input.get('businessType', '')
        unique_selling_point = user_input.get('uniqueSellingPoint', '')
        vibe = user_input.get('vibe', 'chaotic-good')
        
        optimization_prompt = f"""
        Transform this business into a viral TikTok ad concept:
        
        Business: {business_name}
        Type: {business_type}
        Special thing: {unique_selling_point}
        Vibe: {vibe}
        
        Create a JSON response with:
        {{
            "viral_title": "Catchy meme-style title",
            "script": "TikTok voiceover text with *sound effects*",
            "visual_description": "Detailed scene description for image generation",
            "optimized_sd_prompt": "Perfect Stable Diffusion prompt for viral aesthetic",
            "motion_concept": "How this should animate/move in video",
            "brainrot_phrases": ["random", "viral", "phrases", "to", "display"]
        }}
        
        Make it genuinely viral, unhinged but effective. Think current TikTok brainrot trends.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a viral TikTok content creator who makes unhinged but effective business ads. Always respond with valid JSON only."},
                    {"role": "user", "content": optimization_prompt}
                ],
                temperature=0.9,
                max_tokens=800
            )
            
            content = response.choices[0].message.content.strip()
            
            # Clean JSON response
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            
            optimized = json.loads(content)
            
            # Add metadata
            optimized.update({
                'original_input': user_input,
                'generated_at': time.time(),
                'id': f"opt_{int(time.time())}"
            })
            
            print(f"✅ LLM optimized: {optimized['viral_title']}")
            return optimized
            
        except Exception as e:
            print(f"❌ LLM optimization failed: {e}")
            return self._fallback_optimization(user_input)

    def generate_image(self, optimized_concept: dict) -> str:
        """Generate SD image from optimized concept"""
        
        sd_prompt = optimized_concept.get('optimized_sd_prompt', optimized_concept.get('visual_description', ''))
        enhanced_prompt = f"{sd_prompt}, viral meme style, trending on TikTok, surreal digital art, high contrast, bold colors"
        
        if not self.stability_api_key:
            return self._create_placeholder_image(optimized_concept)
        
        try:
            response = requests.post(
                "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
                headers={
                    "Authorization": f"Bearer {self.stability_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "text_prompts": [
                        {"text": enhanced_prompt, "weight": 1},
                        {"text": "blurry, low quality, text, watermark", "weight": -0.5}
                    ],
                    "cfg_scale": 8,
                    "height": 1024,
                    "width": 1024,
                    "steps": 30,
                    "samples": 1,
                    "style_preset": "digital-art"
                },
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                image_data = base64.b64decode(data["artifacts"][0]["base64"])
                image = Image.open(io.BytesIO(image_data))
                
                filename = f"sd_image_{optimized_concept['id']}.png"
                filepath = os.path.join("outputs", filename)
                
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                
                image.save(filepath, optimize=True, quality=95)
                print(f"✅ SD image generated: {filepath}")
                return filepath
            else:
                return self._create_placeholder_image(optimized_concept)
                
        except Exception as e:
            print(f"❌ SD generation failed: {e}")
            return self._create_placeholder_image(optimized_concept)

    def _create_ultimate_brainrot_video(self, image_path: str, concept: dict) -> str:
        """Create 15-second ultimate brainrot video"""
        try:
            # Simplified version of the ultimate brainrot video
            base_image = Image.open(image_path).convert("RGB")
            base_image = base_image.resize((576, 1024), Image.Resampling.LANCZOS)
            
            frames = []
            total_frames = 90  # 15 seconds
            
            for i in range(total_frames):
                frame = base_image.copy()
                
                # Add various effects
                if i % 6 == 0:  # Flash effect
                    enhancer = ImageEnhance.Brightness(frame)
                    frame = enhancer.enhance(2.0)
                
                # Add text
                draw = ImageDraw.Draw(frame)
                title = concept.get('viral_title', 'BRAINROT')
                
                try:
                    font = ImageFont.truetype("C:/Windows/Fonts/impact.ttf", 60)
                except:
                    font = ImageFont.load_default()
                
                # Outline text
                for dx in range(-3, 4):
                    for dy in range(-3, 4):
                        draw.text((50 + dx, 50 + dy), title, fill='black', font=font)
                draw.text((50, 50), title, fill='white', font=font)
                
                frames.append(np.array(frame))
            
            video_filename = f"brainrot_{concept['id']}.mp4"
            video_path = os.path.join("outputs", video_filename)
            imageio.mimsave(video_path, frames, fps=6, format='mp4')
            
            print(f"✅ Brainrot video created: {video_filename}")
            return video_path
            
        except Exception as e:
            print(f"❌ Brainrot video failed: {e}")
            return None

    def _create_placeholder_image(self, concept: dict) -> str:
        """Create placeholder image"""
        img = Image.new('RGB', (1024, 1024), color=(100, 50, 150))
        filename = f"placeholder_{concept['id']}.png"
        filepath = os.path.join("outputs", filename)
        img.save(filepath)
        return filepath

    def _fallback_optimization(self, user_input: dict) -> dict:
        """Fallback optimization"""
        return {
            'viral_title': f"The {user_input.get('businessName', 'Business')} Experience",
            'script': f"POV: You discover {user_input.get('businessName', 'this business')} *vine boom*",
            'visual_description': f"Surreal {user_input.get('businessType', 'business')} in a fever dream",
            'optimized_sd_prompt': f"cursed {user_input.get('businessType', 'store')}, viral meme style",
            'brainrot_phrases': ["OHIO", "SIGMA", "RIZZ"],
            'original_input': user_input,
            'generated_at': time.time(),
            'id': f"fallback_{int(time.time())}"
        }

    def run_interactive_mode(self):
        """Main interactive mode"""
        # Show menu
        choice = self.show_menu()
        
        # Get business info
        business_info = self.get_business_info()
        
        print(f"\n🚀 Starting generation...")
        
        # Run selected mode
        if choice == 1:
            result = self.mode_1_random_brainrot(business_info)
        elif choice == 2:
            result = self.mode_2_reddit_tts_brainrot(business_info)
        elif choice == 3:
            result = self.mode_3_celebrity_brainrot(business_info)
        
        # Show results
        if result.get('success', False):
            print(f"\n🎉 {result.get('mode', 'Generation')} COMPLETE!")
            if 'video_path' in result:
                print(f"📹 Video: {result['video_path']}")
            print(f"📁 Check the outputs folder!")
        else:
            print(f"\n❌ {result.get('mode', 'Generation')} failed")
            if 'error' in result:
                print(f"Error: {result['error']}")

    def _create_placeholder_gameplay(self):
        """Create a placeholder gameplay video"""
        try:
            print("🎮 Creating placeholder gameplay video...")
            
            # Create simple "gameplay" frames
            frames = []
            for i in range(180):  # 30 seconds at 6fps
                # Create a simple animated background
                frame = Image.new('RGB', (576, 1024), color=(20, 20, 40))
                draw = ImageDraw.Draw(frame)
                
                # Add some "game" elements
                # Moving rectangles like a simple game
                for j in range(5):
                    x = (i * 3 + j * 100) % 600
                    y = 200 + j * 150
                    color = [(255, 100, 100), (100, 255, 100), (100, 100, 255), (255, 255, 100), (255, 100, 255)][j]
                    draw.rectangle([x, y, x+50, y+80], fill=color)
                
                # Add "game UI"
                draw.text((20, 50), f"SCORE: {i * 10}", fill='white')
                draw.text((20, 80), f"LEVEL: {i // 30 + 1}", fill='white')
                draw.text((20, 950), "EPIC GAMEPLAY", fill='yellow')
                
                frames.append(np.array(frame))
            
            # Save placeholder gameplay
            gameplay_filename = "placeholder_gameplay.mp4"
            gameplay_path = os.path.join("gameplay_videos", gameplay_filename)
            os.makedirs("gameplay_videos", exist_ok=True)
            
            imageio.mimsave(gameplay_path, frames, fps=6, format='mp4')
            
            print(f"✅ Placeholder gameplay created: {gameplay_filename}")
            return gameplay_path
            
        except Exception as e:
            print(f"❌ Placeholder gameplay creation failed: {e}")
            return None

    def _create_placeholder_celebrity(self):
        """Create a placeholder celebrity image"""
        try:
            print("🌟 Creating placeholder celebrity...")
            
            # Create a simple "celebrity" image
            img = Image.new('RGB', (1024, 1024), color=(80, 60, 120))
            draw = ImageDraw.Draw(img)
            
            # Draw a simple face
            # Head
            draw.ellipse([300, 200, 724, 624], fill=(220, 180, 140))
            
            # Eyes
            draw.ellipse([400, 350, 450, 400], fill='white')
            draw.ellipse([574, 350, 624, 400], fill='white')
            draw.ellipse([415, 365, 435, 385], fill='black')
            draw.ellipse([589, 365, 609, 385], fill='black')
            
            # Nose
            draw.polygon([(512, 420), (502, 450), (522, 450)], fill=(200, 160, 120))
            
            # Mouth
            draw.arc([480, 480, 544, 520], 0, 180, fill='red', width=5)
            
            # Add text
            try:
                font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 60)
            except:
                font = ImageFont.load_default()
            
            draw.text((350, 700), "AI CELEBRITY", fill='white', font=font)
            
            # Save placeholder celebrity
            celebrity_filename = "ai_celebrity.png"
            celebrity_path = os.path.join("celebrity_faces", celebrity_filename)
            os.makedirs("celebrity_faces", exist_ok=True)
            
            img.save(celebrity_path)
            
            print(f"✅ Placeholder celebrity created: {celebrity_filename}")
            return celebrity_path
            
        except Exception as e:
            print(f"❌ Placeholder celebrity creation failed: {e}")
            return None

# API function for teammates
def generate_shitpost_ad(business_data, mode=1):
    """API function for teammates"""
    pipeline = InteractiveBrainrotPipeline()
    
    if mode == 1:
        return pipeline.mode_1_random_brainrot(business_data)
    elif mode == 2:
        return pipeline.mode_2_reddit_tts_brainrot(business_data)
    elif mode == 3:
        return pipeline.mode_3_celebrity_brainrot(business_data)

if __name__ == "__main__":
    pipeline = InteractiveBrainrotPipeline()
    pipeline.run_interactive_mode()